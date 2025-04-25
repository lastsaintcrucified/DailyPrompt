# Setting Up Scheduled Prompt Generation

To automatically generate prompts each day, you can set up a scheduled function
using Vercel Cron Jobs or Firebase Cloud Functions.

## Option 1: Vercel Cron Jobs

1. Create a new API route at `app/api/cron/generate-prompt/route.ts`:

\`\`\`typescript import { NextResponse } from 'next/server' import { db } from
'@/lib/firebase/config' import { doc, setDoc, getDoc, serverTimestamp } from
'firebase/firestore' import { generatePrompt } from '@/lib/ai'

export async function GET(request: Request) { // Verify the request is from
Vercel Cron const authHeader = request.headers.get('Authorization') if
(authHeader !== `Bearer ${process.env.CRON_SECRET}`) { return
NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
}

try { // Generate prompt for tomorrow const tomorrow = new Date()
tomorrow.setDate(tomorrow.getDate() + 1) const tomorrowDate =
tomorrow.toISOString().split('T')[0]

    // Check if a prompt already exists for tomorrow
    const promptRef = doc(db, 'prompts', tomorrowDate)
    const promptSnap = await getDoc(promptRef)

    if (promptSnap.exists()) {
      return NextResponse.json({
        success: false,
        message: 'A prompt already exists for tomorrow'
      })
    }

    // Generate a new prompt using AI
    const promptText = await generatePrompt()

    // Save the prompt to Firebase
    await setDoc(promptRef, {
      text: promptText,
      date: tomorrowDate,
      createdAt: serverTimestamp(),
      source: 'ai',
    })

    return NextResponse.json({
      success: true,
      message: 'Prompt generated and saved successfully',
      date: tomorrowDate,
      prompt: promptText
    })

} catch (error) { console.error('Error in cron job:', error) return
NextResponse.json({ success: false, message: 'Failed to generate prompt' }, {
status: 500 }) } } \`\`\`

2. Add a `CRON_SECRET` environment variable to your Vercel project.

3. Configure the Cron Job in your `vercel.json` file:

\`\`\`json { "crons": [ { "path": "/api/cron/generate-prompt", "schedule": "0 0
* * *" } ] } \`\`\`

This will run the function every day at midnight UTC.

## Option 2: Firebase Cloud Functions

1. Set up Firebase Cloud Functions in your project.

2. Create a scheduled function:

\`\`\`typescript import _ as functions from 'firebase-functions'; import _ as
admin from 'firebase-admin'; import fetch from 'node-fetch';

admin.initializeApp();

export const generateDailyPrompt = functions.pubsub .schedule('0 0 \* \* \*') //
Every day at midnight .timeZone('UTC') .onRun(async (context) => { try { //
Generate prompt for tomorrow const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1); const tomorrowDate =
tomorrow.toISOString().split('T')[0];

      // Check if a prompt already exists for tomorrow
      const promptRef = admin.firestore().collection('prompts').doc(tomorrowDate);
      const promptDoc = await promptRef.get();

      if (promptDoc.exists) {
        console.log(`A prompt already exists for ${tomorrowDate}`);
        return null;
      }

      // Call your API to generate a prompt
      const response = await fetch('https://your-app-url.vercel.app/api/generate-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.API_SECRET}`
        },
        body: JSON.stringify({ date: tomorrowDate })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      // Save the prompt to Firestore
      await promptRef.set({
        text: data.prompt,
        date: tomorrowDate,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        source: 'ai',
      });

      console.log(`Successfully generated prompt for ${tomorrowDate}`);
      return null;
    } catch (error) {
      console.error('Error generating daily prompt:', error);
      return null;
    }

}); \`\`\`

3. Deploy your Firebase Cloud Functions.

Choose the option that best fits your project's infrastructure. \`\`\`

Let's also create the cron API route:
