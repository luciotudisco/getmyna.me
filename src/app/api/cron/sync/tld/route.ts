import axios from 'axios';
import { NextResponse } from 'next/server';

export async function GET(request: Request): Promise<NextResponse> {
    console.log('request', request);
    const response = await axios.get('http://worldtimeapi.org/api/timezone/America/Chicago');
    const data = await response.data;
    return NextResponse.json({ datetime: data.datetime });
}
