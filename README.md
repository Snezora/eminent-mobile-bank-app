# Eminent Western Bank Application

This bank application is developed in purpose to showcase the bank loan approval prediction.

## Requirements
- Node.js
- Expo Go
- Python version 13.0.0 and above


## How to Install (For Windows)
1. Please perform git pull on this repository. 

```ps
git pull https://github.com/Snezora/fyp.git
```

2. Open 3 command prompts / Windows Powershell with administrator privileges.

> ### Focus on First Command Prompt

3. Insert these two commands into the first command prompt.

```ps
> cd frontend 
> npm start
```

4. Download Expo Go on your mobile device.

> **Android**: [Google Play Store Link](https://play.google.com/store/apps/details?id=host.exp.exponent&referrer=www)  
> **iOS**: [Apple App Store Link](https://itunes.apple.com/app/apple-store/id982107779)


5. After downloading Expo Go and signing in, use your mobile phone to scan the QR code shown in Command Prompt.
![Image showing QR Code for scanning on phone](/frontend/assets/images/expoLoad.png)

> ### Focus on Second Command Prompt

6. Insert these three commands into the second command prompt.

```ps
> cd backend 
> venv\Scripts\activate
> fastapi dev main.py
```

7. Proceed to Step 8 once this running message shows
![FastAPI loaded successfully](/frontend/assets/images/fastApiLoad.png)

> ### Focus on Third Command Prompt

8. Perform this command to install localtunnel in order to access backend from mobile phone.  
```ps
npm install -g localtunnel
```

9. Perform these two command to open the localtunnel  
Note: *Switch the port to the port that you have got from Step 7.*
```ps
> cd frontend
> lt --subdomain bank-fyp-backend --port 8000
```

10. Start using the application on your mobile phone through Expo Go.


