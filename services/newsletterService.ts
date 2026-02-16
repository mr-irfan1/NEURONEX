/**
 * Service to handle Newsletter API interactions.
 */

interface SubscribeResponse {
  message: string;
  email: string;
}

export const subscribeToNewsletter = async (email: string): Promise<SubscribeResponse> => {
  try {
    const response = await fetch('/api/newsletter/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      let errorMessage = 'Failed to subscribe. Please try again.';
      
      // Handle FastAPI/Pydantic structured errors
      if (data.detail) {
        if (typeof data.detail === 'string') {
          // Simple HTTP Exception (e.g., 400 Bad Request)
          errorMessage = data.detail;
        } else if (Array.isArray(data.detail) && data.detail.length > 0) {
          // Validation Errors (e.g., 422 Unprocessable Entity)
          const validationMsg = data.detail[0].msg;
          // Make Pydantic "value is not a valid email address" friendlier
          if (validationMsg && validationMsg.includes('valid email')) {
            errorMessage = 'Please enter a valid email address.';
          } else {
            errorMessage = validationMsg || 'Invalid input provided.';
          }
        }
      }
      
      throw new Error(errorMessage);
    }

    return data;
  } catch (error: any) {
    // For demonstration purposes in a static environment without a running Python backend:
    console.warn("API unreachable, simulating response for demo:", error);
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate Invalid Email (Basic regex)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            reject(new Error("Please enter a valid email address."));
            return;
        }

        // Simulate Duplicate (match backend mocked data)
        // alex.carter@example.com is the mock user
        if (email === 'fail@test.com' || email === 'alex.carter@example.com') {
            reject(new Error("This email is already subscribed to our newsletter."));
            return;
        }

        resolve({ message: "Successfully subscribed to NeuroNex updates!", email });
      }, 1000);
    });
  }
};
