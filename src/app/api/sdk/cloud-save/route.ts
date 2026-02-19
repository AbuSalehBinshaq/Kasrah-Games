import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * API Endpoint for Cloud Save
 * Receives data from External SDK and saves it to JSON files (Render-safe)
 */

const DATA_DIR = path.join(process.cwd(), 'data', 'cloud-saves');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { gameId, data, timestamp } = body;

        if (!gameId) {
            return NextResponse.json({ success: false, error: 'Missing gameId' }, { status: 400 });
        }

        // Create a unique filename for each game's data
        const filePath = path.join(DATA_DIR, `${gameId}.json`);
        
        // Save data to file
        fs.writeFileSync(filePath, JSON.stringify({
            gameId,
            data,
            lastUpdated: timestamp || Date.now()
        }, null, 2));

        return NextResponse.json({ success: true, message: 'Data saved successfully' });
    } catch (error: any) {
        console.error('Cloud Save Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const gameId = searchParams.get('gameId');

        if (!gameId) {
            return NextResponse.json({ success: false, error: 'Missing gameId' }, { status: 400 });
        }

        const filePath = path.join(DATA_DIR, `${gameId}.json`);

        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            return NextResponse.json(JSON.parse(fileContent));
        } else {
            return NextResponse.json({ success: true, data: {} });
        }
    } catch (error: any) {
        console.error('Cloud Load Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
