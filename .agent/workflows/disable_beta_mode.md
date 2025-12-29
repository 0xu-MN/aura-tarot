---
description: How to disable Beta mode and restore premium features
---

To transition the application from "Beta Mode" (free, restricted) back to "Premium Mode" (paid, full access), follow these steps:

1.  **Open the Configuration File**:
    Navigate to `src/lib/beta-config.ts`.

2.  **Toggle the Flag**:
    Change the `IS_BETA_ACTIVE` constant from `true` to `false`.

    ```typescript
    // src/lib/beta-config.ts
    
    // Change this line:
    export const IS_BETA_ACTIVE = false; // Set to false to disable Beta mode
    ```

3.  **Verify the Changes**:
    - **Home Screen**: The "Beta Banner" should disappear.
    - **Premium Content**: Access to `LoveTarot`, `ReunionTarot`, etc., should now trigger the payment modal instead of the "Beta Lock" screen.
    - **Daily Drop**: The daily limit toast message will no longer appear. Instead, the payment modal will appear for draws beyond the free limit.
    - **Chatbot**: The 5-message limit will be lifted (or revert to standard premium limits if implemented).

4.  **Deploy**:
    Commit and push the change to deploy the Premium version.
    ```bash
    git add src/lib/beta-config.ts
    git commit -m "chore: Disable Beta mode, restore premium features"
    git push
    ```
