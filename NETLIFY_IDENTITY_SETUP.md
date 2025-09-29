# Netlify Identity Setup Guide for AnkiQuiz

## Overview
This guide will help you complete the setup of Netlify Identity authentication for your AnkiQuiz application.

## Prerequisites
- Netlify account
- Your project deployed on Netlify
- Admin access to your Netlify site

## Step 1: Enable Identity in Netlify Dashboard

1. **Go to your Netlify site dashboard**
   - Visit [netlify.com](https://netlify.com)
   - Select your AnkiQuiz site

2. **Enable Identity**
   - Go to **Site settings** → **Identity**
   - Click **Enable Identity**
   - Choose your registration preferences:
     - **Open**: Anyone can sign up
     - **Invite only**: Only invited users can sign up
     - **Closed**: No new registrations

3. **Configure Identity Settings**
   - **External providers**: Enable Google, GitHub, etc. (optional)
   - **Email templates**: Customize welcome emails
   - **GoTrue settings**: Configure JWT expiration, etc.

## Step 2: Configure Site Settings

1. **Set up redirects** (if not already done)
   - Go to **Site settings** → **Redirects and rewrites**
   - Add redirect for Identity callback:
     ```
     /auth/callback  /.netlify/identity 200
     ```

2. **Configure environment variables** (if needed)
   - Go to **Site settings** → **Environment variables**
   - Add any custom variables your app needs

## Step 3: Test Authentication

1. **Deploy your changes**
   - Push your code changes to trigger a new deployment
   - Or manually trigger a deploy from Netlify dashboard

2. **Test the authentication flow**
   - Visit your deployed site
   - Click the "Login" button
   - Try registering a new account
   - Test login/logout functionality

## Step 4: Optional - Require Authentication

If you want to make authentication mandatory:

1. **Update HTML meta tag**
   ```html
   <meta name="require-auth" content="true">
   ```

2. **Redeploy your site**

## Step 5: Advanced Configuration

### Custom Email Templates
1. Go to **Site settings** → **Identity** → **Email templates**
2. Customize templates for:
   - Welcome email
   - Password reset
   - Email confirmation

### External Providers
1. Go to **Site settings** → **Identity** → **External providers**
2. Enable providers like:
   - Google
   - GitHub
   - GitLab
   - Bitbucket

### User Management
1. Go to **Site settings** → **Identity** → **Users**
2. View and manage registered users
3. Send invitations
4. Reset passwords

## Configuration Options

### Authentication Modes

**Optional Authentication** (current setup):
```html
<meta name="enable-auth" content="true">
<meta name="require-auth" content="false">
```

**Required Authentication**:
```html
<meta name="enable-auth" content="true">
<meta name="require-auth" content="true">
```

**Disabled Authentication**:
```html
<meta name="enable-auth" content="false">
```

### API Integration

Use the AuthManager for authenticated API calls:

```javascript
// Make authenticated request
const response = await window.authManager.authenticatedRequest('/api/protected-endpoint', {
  method: 'POST',
  body: JSON.stringify({ data: 'example' })
});

// Get current user
const user = window.authManager.getUser();

// Check authentication status
if (window.authManager.isAuthenticated()) {
  // User is logged in
}
```

## Troubleshooting

### Common Issues

1. **Identity widget not loading**
   - Check Content Security Policy in `netlify.toml`
   - Ensure `https://identity.netlify.com` is allowed

2. **Login button not working**
   - Check browser console for errors
   - Verify Netlify Identity is enabled on your site

3. **Users can't register**
   - Check registration settings in Netlify dashboard
   - Verify email confirmation is not required if not configured

4. **Authentication state not persisting**
   - Check if cookies are enabled
   - Verify HTTPS is being used

### Debug Mode

Enable debug mode in your configuration:
```html
<meta name="enable-debug" content="true">
```

This will show additional console logs for troubleshooting.

## Security Considerations

1. **HTTPS Only**: Always use HTTPS in production
2. **Content Security Policy**: Properly configured CSP headers
3. **JWT Expiration**: Set appropriate token expiration times
4. **User Data**: Be mindful of what user data you store and display

## Next Steps

1. **User Roles**: Implement role-based access control if needed
2. **API Protection**: Protect sensitive API endpoints
3. **User Profiles**: Add user profile management
4. **Analytics**: Track authentication events
5. **Testing**: Add automated tests for authentication flows

## Support

- [Netlify Identity Documentation](https://docs.netlify.com/visitor-access/identity/)
- [Netlify Community](https://community.netlify.com/)
- [GitHub Issues](https://github.com/thaild/ankiquiz/issues)
