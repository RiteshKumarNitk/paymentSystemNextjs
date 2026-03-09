import { NextResponse } from "next/server";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ tenantSlug: string }> }
) {
    const { tenantSlug } = await params;
    const response = NextResponse.json({ success: true });
    response.cookies.delete(`member_token_${tenantSlug}`);
    return response;
}
