# Privacy Policy for The English Hub Bot

**Last Updated: June 11, 2026** (Version 4.0.0)

## 1. Introduction

Welcome to The English Hub Bot ("we", "our", "the bot"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you interact with our Discord bot.

By using The English Hub Bot, you agree to the collection and use of information in accordance with this policy.

## 2. Information We Collect

### 2.1 Automatically Collected Information

When you use our bot in Discord servers, we may automatically collect certain information:

- **User IDs and Usernames**: For identification and moderation purposes
- **Server IDs**: To provide server-specific functionality
- **Message Content**: When necessary for command processing and moderation features
- **Voice Channel Activity**: For our camera enforcement system in designated channels
- **Timestamps**: For logging and analytical purposes

### 2.2 Temporarily Cached Data

For performance optimization, we temporarily cache:
- Guild member lists
- User data required for active moderation actions
- Recent message content for automod processing

## 3. How We Use Your Information

We use the collected information for the following purposes:

- **Bot Functionality**: Processing commands and providing requested features
- **Moderation**: Enforcing server rules and maintaining a positive community
- **Analytics**: Understanding bot usage patterns to improve performance
- **Security**: Preventing abuse, spam, and malicious activity
- **Communication**: Sending welcome messages and important announcements

## 4. Data Storage and Retention

### 4.1 Redis Caching

We use Redis for temporary data storage:
- **Purpose**: Performance optimization and real-time feature functionality
- **Retention**: Data is automatically cleared based on feature requirements
- **Location**: Secure cloud-based Redis instance

### 4.2 PostgreSQL Database

We use PostgreSQL for persistent data storage:
- **Purpose**: Long-term storage of moderation records and punishment history
- **Retention**: Moderation records are retained indefinitely for historical tracking
- **Location**: Secure cloud-based PostgreSQL instance

### 4.3 Data Retention Periods

- **Temporary Cache (Redis)**: Cleared automatically (typically within 24-48 hours)
- **Active Moderation Data**: Retained only while actions are pending
- **Moderation Records (PostgreSQL)**: Retained indefinitely for historical purposes
- **Logs**: Retained for diagnostic purposes (maximum 30 days)

## 5. Data Sharing and Disclosure

### 5.1 No Third-Party Sharing

We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties.

### 5.2 Required Disclosures

We may disclose information when:
- Required by law or legal process
- Necessary to protect our rights or property
- Required to prevent harm or illegal activities
- Authorized by Discord's Terms of Service

### 5.3 Server Administrators

Certain bot functionality may display limited user information to server administrators and moderators within their own servers.

## 6. User Rights and Choices

### 6.1 Access and Control

Users can:
- View what data the bot can access through Discord's privacy settings
- Request information about stored data by contacting server administrators
- Have their data removed from bot systems by leaving the server

### 6.2 Opt-Out Options

- **Direct Messages**: Users can opt-out of bot DMs by blocking the bot
- **Data Collection**: Users can leave servers where the bot operates
- **Specific Features**: Some features can be disabled by server administrators

## 7. Security Measures

We implement appropriate technical and organizational measures to protect your data:

- **Encryption**: All data transmissions are encrypted
- **Access Controls**: Limited access to sensitive systems
- **Regular Audits**: Security practices are regularly reviewed
- **Compliance**: Adherence to Discord's Developer Terms of Service

## 8. Children's Privacy

Our bot is not directed to children under 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under age 13, we will delete that information.

## 9. Changes to This Policy

We may update this Privacy Policy from time to time. We will notify users of any significant changes by:

- Posting the new Privacy Policy on our GitHub repository
- Announcing updates in our official Discord server
- Providing version history and change logs

Your continued use of the bot after any changes constitutes acceptance of the new Privacy Policy.

## 10. Contact Information

For questions about this Privacy Policy or our data practices:

- **GitHub**: https://github.com/The-English-Hub-Dev/The-English-Hub
- **Discord Server**: https://discord.gg/enghub
- **Email**: theenglishhubdevs@gmail.com

## 11. Specific Feature Disclosures

### 11.1 Automod System

- **Data Accessed**: Message content for invite link and walltext detection
- **Storage**: Temporary cache only during processing
- **Purpose**: Prevent spam and unauthorized server invites

### 11.2 Member Tracking

- **Data Accessed**: User IDs, join timestamps, member counts
- **Storage**: Temporary for analytics display
- **Purpose**: Server growth tracking and milestone celebrations

### 11.3 Camera Enforcement

- **Data Accessed**: Voice state information, user IDs
- **Storage**: Active session data only
- **Purpose**: Enforce camera requirements in designated channels

### 11.4 DM Forwarding

- **Data Accessed**: Direct message content, user IDs, usernames
- **Storage**: Temporary during forwarding process; logged in moderation logs
- **Purpose**: Allow users to contact staff through the bot

### 11.5 AFK Status Tracking

- **Data Accessed**: User IDs, AFK reason text, timestamps
- **Storage**: Redis cache during active AFK status
- **Purpose**: Notify users when mentioned if they are marked as away

### 11.6 Message Triggers

- **Data Accessed**: Message content for trigger matching
- **Storage**: Trigger patterns cached in Redis (15-30 second cache)
- **Purpose**: Automated responses to server-specific or highlight triggers

### 11.7 Moderation Logging

- **Data Accessed**: User IDs, usernames, moderator IDs, punishment reasons, timestamps
- **Storage**: PostgreSQL database with indefinite retention for moderation records
- **Purpose**: Track warnings, mutes, bans, and other disciplinary actions

### 11.8 Voice Channel Bans

- **Data Accessed**: User IDs, voice channel IDs, ban timestamps
- **Storage**: Redis cache during active ban period (24-hour default)
- **Purpose**: Enforce temporary bans from specific voice channels

### 11.9 Mute Management

- **Data Accessed**: User IDs, mute expiration timestamps
- **Storage**: Redis cache during active mute period
- **Purpose**: Track and automatically remove mute role after specified duration

### 11.10 Member Count Analytics

- **Data Accessed**: Member IDs, join timestamps, user roles, bot status
- **Storage**: Temporary during command execution
- **Purpose**: Provide detailed server statistics and growth tracking

## 12. Error Tracking and Monitoring

We use Sentry for error tracking and monitoring:
- **Data Accessed**: Error messages, stack traces, and system information
- **Storage**: Sentry's secure servers
- **Purpose**: Monitor bot health, identify bugs, and improve stability
- **Note**: Error data may contain limited user context but is used only for debugging

## 13. Compliance with Discord Requirements

This Privacy Policy complies with:
- Discord's Developer Terms of Service
- Discord's Bot Guidelines
- Privacy requirements for privileged intents

## 14. Data Subject Rights

Users have the right to:
- Request access to their personal data
- Request deletion of their personal data (by leaving the server)
- Request correction of inaccurate data
- Request restriction of processing

To exercise these rights, please contact us at theenglishhubdevs@gmail.com with details about your request.

By using The English Hub Bot, you acknowledge that you have read and understood this Privacy Policy and agree to its terms.
