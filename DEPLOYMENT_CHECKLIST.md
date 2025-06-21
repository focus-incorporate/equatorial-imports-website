# Deployment Checklist - Equatorial Imports

## 🚀 Pre-Deployment Requirements

### **Email System Setup (Critical for Production)**

#### **1. Domain Verification (Required - 3-5 days lead time)**

**Domain Requirements:**
- [ ] Confirm ownership of `equatorialimports.sc` domain
- [ ] Access to DNS management panel (registrar/hosting provider)
- [ ] Add Resend domain in [Resend Dashboard](https://resend.com/domains)

**DNS Records to Add:**
```
Type: TXT
Name: @ (or equatorialimports.sc)
Value: [SPF Record - provided by Resend]

Type: TXT  
Name: resend._domainkey
Value: [DKIM Record - provided by Resend]

Type: TXT (Optional but recommended)
Name: _dmarc
Value: [DMARC Record - provided by Resend]
```

**Timeline:** 24-72 hours for DNS propagation + Resend verification

#### **2. Email Configuration Updates**

**Code Changes Needed:**
- [ ] Update `src/app/api/send-order-email/route.ts`:
  - Change `from: 'Equatorial Imports <orders@resend.dev>'`
  - To `from: 'Equatorial Imports <orders@equatorialimports.sc>'`
- [ ] Update admin notification email:
  - Change `to: ['admin@resend.dev']`
  - To your business email address
- [ ] Test email templates with real domain

#### **3. Environment Variables**

**Development:**
- [x] `.env.local` configured with `RESEND_API_KEY`
- [x] `.env.local` added to `.gitignore`

**Production Setup:**
- [ ] Add `RESEND_API_KEY=re_B7Sa7HeZ_4LGftpwSHCdfK13U6ieQTtjd` to hosting platform
- [ ] Configure additional email environment variables:
  ```
  ADMIN_EMAIL=your-admin@equatorialimports.sc
  BUSINESS_EMAIL=info@equatorialimports.sc
  ```

#### **4. Email Testing & Validation**

**Pre-Launch Testing:**
- [ ] Test order placement with real email sending
- [ ] Verify customer confirmation emails are delivered
- [ ] Verify admin notification emails are received
- [ ] Test email formatting across different clients:
  - [ ] Gmail (web & mobile)
  - [ ] Outlook (web & desktop)
  - [ ] Apple Mail
  - [ ] Mobile email apps

**Deliverability Testing:**
- [ ] Check emails don't go to spam folders
- [ ] Test with various email providers
- [ ] Verify email authentication passes (SPF/DKIM)

#### **5. Business Email Setup**

**Professional Email Addresses:**
- [ ] `orders@equatorialimports.sc` - Order confirmations
- [ ] `admin@equatorialimports.sc` - Admin notifications
- [ ] `info@equatorialimports.sc` - General inquiries
- [ ] `support@equatorialimports.sc` - Customer support

#### **6. Backup & Monitoring**

**Email Reliability:**
- [ ] Configure email logging for debugging
- [ ] Set up monitoring for email delivery failures
- [ ] Consider backup email service (SendGrid/Mailgun)
- [ ] Implement email queue for high-volume periods

#### **7. Legal & Compliance**

**Email Compliance:**
- [ ] Add business contact information to email footers
- [ ] Include unsubscribe mechanism (if doing marketing)
- [ ] Ensure GDPR compliance for email data handling
- [ ] Add privacy policy link to emails

---

## 📋 Other Deployment Tasks

### **Application Deployment**
- [ ] Build production version (`npm run build`)
- [ ] Test production build locally (`npm start`)
- [ ] Deploy to hosting platform (Vercel/Netlify/etc.)
- [ ] Configure custom domain
- [ ] Set up SSL certificate

### **Performance & SEO**
- [ ] Test site performance (Lighthouse)
- [ ] Verify SEO metadata
- [ ] Submit sitemap to search engines
- [ ] Test mobile responsiveness

### **Analytics & Monitoring**
- [ ] Set up Google Analytics
- [ ] Configure error monitoring (Sentry)
- [ ] Set up uptime monitoring

---

## ⚡ Quick Test (Before Domain Setup)

For immediate testing without domain verification:

1. Update email addresses in `/src/app/api/send-order-email/route.ts`:
   ```typescript
   to: ['your-personal-email@gmail.com'] // Your email for testing
   ```

2. Test order placement to verify email functionality works

3. Revert to business emails after domain verification

---

## 🚨 Critical Notes

- **Email system will NOT work in production without domain verification**
- **DNS changes can take up to 72 hours to propagate**
- **Start domain verification process 3-5 days before launch**
- **Test thoroughly after domain verification completes**

---

## ✅ Deployment Ready Checklist

- [ ] Domain verification completed and verified in Resend
- [ ] All email addresses updated to use verified domain
- [ ] Environment variables configured in production
- [ ] Email sending tested and working
- [ ] Application built and deployed
- [ ] Custom domain configured with SSL

**Estimated Total Time:** 5-7 days (including DNS propagation wait time)