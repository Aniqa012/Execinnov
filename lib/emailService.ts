import nodemailer from 'nodemailer';
import crypto from 'crypto';

const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, 
    },
});
    
export const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const generateVerificationToken = (): string => {
    return crypto.randomBytes(32).toString('hex');
};

// Send verification email
export const sendVerificationEmail = async (email: string, otp: string) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify Your Email - ExecInnov',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Welcome to ExecInnov!</h2>
                <p>Hi,</p>
                <p>Thank you for signing up! Please verify your email address by entering the following OTP:</p>
                <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
                    <h1 style="color: #007bff; font-size: 32px; margin: 0;">${otp}</h1>
                </div>
                <p>This OTP will expire in 5 minutes.</p>
                <p>If you didn't create an account, please ignore this email.</p>
                <p>Best regards,<br>The ExecInnov Team</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Email sending error:', error);
        return false;
    }
};

// Send password reset email
export const sendPasswordResetEmail = async (email: string, otp: string, name: string) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Request - ExecInnov',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Password Reset Request</h2>
                <p>Hi ${name},</p>
                <p>We received a request to reset your password. Please enter the following OTP to proceed:</p>
                <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
                    <h1 style="color: #007bff; font-size: 32px; margin: 0;">${otp}</h1>
                </div>
                <p>This OTP will expire in 5 minutes.</p>
                <p>If you didn't request a password reset, please ignore this email.</p>
                <p>Best regards,<br>The ExecInnov Team</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Email sending error:', error);
        return false;
    }
};
