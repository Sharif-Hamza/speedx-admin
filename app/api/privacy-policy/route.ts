import { NextResponse } from 'next/server'

// Use the F1 dashboard API endpoint - ALWAYS localhost:3000
const F1_DASHBOARD_URL = 'http://localhost:3000'

export async function GET() {
  try {
    const response = await fetch(`${F1_DASHBOARD_URL}/api/privacy-policy`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch privacy policy')
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching privacy policy:', error)
    return NextResponse.json(
      { error: 'Failed to fetch privacy policy' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    
    const response = await fetch(`${F1_DASHBOARD_URL}/api/privacy-policy`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    
    if (!response.ok) {
      throw new Error('Failed to update privacy policy')
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating privacy policy:', error)
    return NextResponse.json(
      { error: 'Failed to update privacy policy' },
      { status: 500 }
    )
  }
}
