import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, message, orderType } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Create contact submission object
    const contactSubmission = {
      id: `CONTACT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      name,
      email,
      phone: phone || '',
      message,
      orderType,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };

    // In a real application, you would:
    // 1. Save to database
    // 2. Send email notification to business
    // 3. Send confirmation email to customer
    // 4. Integrate with CRM system
    
    // For now, we'll log it and simulate success
    console.log('Contact form submission:', contactSubmission);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      submissionId: contactSubmission.id,
      message: 'Thank you for your message! We\'ll get back to you within 24 hours.'
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}