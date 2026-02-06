# Claude Code Instructions for Academic Website

## News Updates

When I say "add news:" followed by a short description, do the following:

1. Parse my input to extract the date, type (paper/talk/grant/position/other), venue, co-authors, and description.
2. Write the news entry matching the existing HTML format in news.html:
   - Bold venue/conference names
   - Concise: one sentence, two at most
   - Include co-authors for paper acceptances
   - Date format: "Mon YYYY"
3. Add the new entry to the TOP of the correct year section in news.html. If the year doesn't exist yet, create a new year header.
4. If the new entry is among the 5 most recent, update index.html too: add it to the top of the news section and remove the oldest entry to keep exactly 5.
5. If es/index.html and es/news.html exist, add the translated Spanish version there too.
6. Do not modify anything else on any page.
7. Commit with message: "Add news: [short description]"
