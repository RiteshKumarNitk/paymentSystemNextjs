import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
    try {
        const result = await pool.query("SELECT * FROM events ORDER BY event_date ASC");
        return NextResponse.json(result.rows);
    } catch (error: any) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, description, event_date, location } = body;

        if (!title) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 });
        }

        const query = `
      INSERT INTO events (title, description, event_date, location)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
        const values = [title, description, event_date, location];

        const result = await pool.query(query, values);
        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error: any) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
    }
}
