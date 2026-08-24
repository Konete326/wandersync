export const buildItineraryPrompt = ({
  destination,
  startDate,
  endDate,
  durationDays,
  budgetLevel,
  travelStyle,
  companions,
  interests,
  currency = 'USD'
}) => {
  return `You are a world-class travel maestro. Create a detailed ${durationDays}-day travel itinerary for ${destination}.
Travel Dates: ${startDate} to ${endDate}.
Budget Level: ${budgetLevel}.
Travel Style: ${travelStyle}.
Companions: ${companions || 'Solo'}.
Interests: ${interests || 'Sightseeing, Culture, Food'}.
Currency: ${currency}.

Return a STRICT JSON object matching this exact schema:
{
  "title": "String (e.g. 5-Day Cultural Odyssey in Kyoto)",
  "destination": {
    "city": "String",
    "country": "String",
    "coordinates": { "lat": Number, "lng": Number }
  },
  "overview": "String (2-3 engaging sentences)",
  "highlights": ["String", "String", "String"],
  "budgetLevel": "${budgetLevel}",
  "estimatedTotalCost": Number,
  "currency": "${currency}",
  "days": [
    {
      "dayNumber": 1,
      "title": "String",
      "theme": "String",
      "activities": [
        {
          "timeSlot": "Morning",
          "title": "String",
          "description": "String",
          "locationName": "String",
          "coordinates": { "lat": Number, "lng": Number },
          "durationHours": Number,
          "estimatedCost": Number,
          "category": "Sightseeing",
          "bookingLink": ""
        }
      ]
    }
  ],
  "travelTips": {
    "packing": ["String", "String"],
    "localEtiquette": ["String", "String"],
    "transitAdvice": ["String", "String"]
  }
}

Ensure all coordinates are accurate geographical lat/lng floats for the destination. Do not include markdown code block formatting in JSON mode.`;
};

export const buildChatRefinePrompt = (currentItinerary, userMessage) => {
  return `You are the WanderSync AI travel assistant.
Current Itinerary:
${JSON.stringify(currentItinerary, null, 2)}

User request: "${userMessage}"

Provide a conversational response with specific guidance and, if modifications to days/activities/budget were requested, provide an updated "updatedItinerary" object in this JSON schema:
{
  "reply": "String message explaining what changes were made or answering the user question",
  "updatedItinerary": null or { ...same structure as Trip schema with changes applied }
}`;
};
