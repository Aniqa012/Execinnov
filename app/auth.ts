import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import User from "./Models/User";
import bcrypt from "bcrypt";
import { signInSchema } from "@/lib/zod";
import dbConnect from "@/lib/dbConnection";

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      isAdmin: boolean;
      image: string;
      emailVerified: boolean;
    };
  }
  
  interface User {
    isAdmin: boolean;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    isAdmin: boolean;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/signin',
    error: '/signin',
  },
  debug: process.env.NODE_ENV === 'development',
  providers: [
    Credentials({
      credentials: {
        email: {
          type: "email",
          label: "Email",
          placeholder: "johndoe@gmail.com",
        },
        password: {
          type: "password",
          label: "Password",
          placeholder: "*****",
        },
      },
      authorize: async (credentials) => {
        try {
          const { email, password } = signInSchema.parse(credentials);
          
          // Ensure database connection before querying
          await dbConnect();
          
          const user = await User.findOne({ email });
          if (!user) {
            console.log(`Login attempt failed: User not found for email: ${email}`);
            return null;
          }
          
          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (!passwordsMatch) {
            console.log(`Login attempt failed: Invalid password for email: ${email}`);
            return null;
          }
          
          console.log(`✅ User authenticated successfully: ${email}`);
          
          // Return user object with role information
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            isAdmin: user.isAdmin,
            image: user.image,
          };
        } catch (error) {
          console.error("Auth error:", error);
          // Return null instead of throwing to prevent server errors
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Persist the OAuth access_token and role to the token right after signin
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token.id) {
        session.user.id = token.id as string;
      }
      if (token.isAdmin) {
        session.user.isAdmin = token.isAdmin;
      }
      return session;
    },
  },
});
