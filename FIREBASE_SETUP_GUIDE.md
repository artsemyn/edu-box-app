# Firebase Setup Guide for EduBox

## What You Need to Do in Firebase Console

### Step 1: Enable Authentication
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **edubox-led**
3. Click on **Authentication** in the left menu
4. Click **Get Started** (if not already enabled)
5. Enable the following sign-in methods:
   - ✅ **Email/Password** - Click "Enable" and Save
   - ✅ **Anonymous** - Click "Enable" and Save (required for LED control)
   - (Optional) **Google** - Enable if you want Google sign-in

### Step 2: Set Up Realtime Database Rules
1. Go to **Realtime Database** in the left menu
2. If you haven't created a database yet:
   - Click **Create Database**
   - Choose a location (e.g., `asia-southeast1` based on your config)
   - Start in **test mode** (we'll update rules next)
3. Click on the **Rules** tab
4. Replace the rules with the following:

```json
{
  "rules": {
    // LED Matrix Control - Anyone can read, authenticated users can write
    "ledMatrix": {
      ".read": true,
      ".write": "auth != null",
      "animation": {
        ".validate": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 14"
      },
      "currentAnimation": {
        "animNumber": {
          ".validate": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 14"
        },
        "animationId": {
          ".validate": "newData.isString()"
        },
        "animationName": {
          ".validate": "newData.isString()"
        },
        "isPlaying": {
          ".validate": "newData.isBoolean()"
        },
        "startedAt": {
          ".validate": "newData.isNumber()"
        },
        "userId": {
          ".validate": "newData.isString()"
        }
      },
      "customPattern": {
        "enabled": {
          ".validate": "newData.isBoolean()"
        }
      }
    },
    
    // User Animations - Users can only read/write their own animations
    "users": {
      "$userId": {
        ".read": "$userId === auth.uid",
        ".write": "$userId === auth.uid",
        "animations": {
          "$animationId": {
            ".validate": "newData.hasChildren(['id', 'name', 'code', 'frames', 'createdAt', 'updatedAt'])"
          }
        }
      }
    },
    
    // Community Animations - Anyone can read, authenticated users can write
    "discuss": {
      "animations": {
        ".read": true,
        "$animationId": {
          ".write": "auth != null",
          ".validate": "newData.hasChildren(['id', 'name', 'code', 'frames', 'createdAt'])"
        }
      }
    }
  }
}
```

5. Click **Publish** to save the rules

### Step 3: Initialize Database Structure (Optional but Recommended)
1. Go to **Realtime Database** → **Data** tab
2. Click the **+** button at the root level
3. Create the following initial structure:

```json
{
  "ledMatrix": {
    "animation": 0,
    "shiftVersion": 1,
    "currentAnimation": {
      "animNumber": 0,
      "animationId": "",
      "animationName": "",
      "isPlaying": false,
      "startedAt": 0,
      "userId": ""
    },
    "customPattern": {
      "enabled": false,
      "frames": []
    }
  },
  "users": {},
  "discuss": {
    "animations": {}
  }
}
```

**Note:** The `users` and `discuss/animations` will be created automatically when users save animations, but you can create empty objects if you want.

### Step 4: Verify Your Configuration
1. Check that your project ID matches: **edubox-led**
2. Verify your database URL: `https://edubox-led-default-rtdb.asia-southeast1.firebasedatabase.app`
3. Ensure Authentication is enabled
4. Ensure Database Rules are published

## Quick Checklist

- [ ] Authentication enabled with Email/Password and Anonymous
- [ ] Realtime Database created and configured
- [ ] Database Rules published (see Step 2 above)
- [ ] Initial database structure created (optional)
- [ ] Database location set to `asia-southeast1` (or your preferred region)

## Testing After Setup

1. **Test Authentication:**
   - Try signing up a new user in your app
   - Try anonymous sign-in

2. **Test Database Write:**
   - Save a custom animation in the app
   - Check Firebase Console → Realtime Database → Data to see if it appears under `users/{userId}/animations`

3. **Test Database Read:**
   - View community animations in the Discuss page
   - Check if animations appear under `discuss/animations`

## Important Notes

- **Security:** The rules above allow:
  - Anyone to read LED matrix status (for device control)
  - Authenticated users to control LED matrix
  - Users to only access their own animations
  - Anyone to read community animations
  - Authenticated users to share animations to community

- **Anonymous Auth:** Required for LED control without user login. Your app uses `signInAnonymously()` for this.

- **Database Location:** Your database is in `asia-southeast1` region. Make sure this matches your Firebase Console.

