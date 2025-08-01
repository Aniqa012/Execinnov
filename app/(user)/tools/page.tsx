import { ToolsClient } from "@/components/ToolsClient";
import { headers } from "next/headers";

async function page() {
  return <ToolsClient headers={await headers()} />;
}

export default page;