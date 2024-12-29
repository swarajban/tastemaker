I would like you to write the code for a React app called Tastemaker. I have detailed requirements below, but please ask me for any clarifying questions if you think anything is under-specified or ambiguous.

# App overview

- App is called Tastemaker
- For each user, the purpose of the app is to create a schedule of meals over a given time period (typically per week) across a per-user library of meal items. The meal scheduler should randomly select different meals for each day (assuming there are enough unique meal items). The user can specify 

# Pages & functionality

- Home page / splash screen with login button
	- When logged in, the default view is the "View schedules" page
- Meal item pages
	- Page to view all items
	- Page to add an item. Fields
		- Title
		- Notes (optional)
		- Type: main or side
		- Tags: multi-select to add a tag to item. Should auto-complete with currently used tags
			- List of tags are per-user
		- Effort: scale of 1 -> 3
	- Page to edit an item (can be same layout/page as "add item" page)
	- Page to view list of items
- Schedule pages
	- Schedule functionality
		- A schedule has a date range, and for each day, there are 1 or 2 meals (lunch and/or dinner)
		- Each meal has exactly 1 'main' item and 1 'side' item
		- When creating a schedule, pick a random assortment of meal items. Some rules:
			- Minimize repeating items during a schedule. If items need to be repeated, spread them out as much as possible
			- A user can specify a restriction to not allow more than one meal of a certain tag per day. For example if there are two mains with the tag "beans", and you need to schedule a day with 2 mains, don't pick 2 meals with tag 'beans' for same day
	- Page to create a new schedule
		- Select date range: default to start tomorrow for 1 week (for example, if creating a schedule on Sunday, the schedule range should be Monday to following Sunday, 7 days total)
		- Ability to edit which days need lunch & dinner (or no meals)
			- Default setting
				- Weekdays: just dinners
				- Weekends: lunches & dinners
		- Ability to select tag restrictions, e.g., don't schedule 2 meals with tag 'beans' on same day
		- Preview schedule button that shows schedule that is about to be created
		- Ability to edit generated schedule:
			- Change any individual meal item
			- Cancel a meal
			- Add a lunch/dinner on any day
		- Save a schedule
	- Page to view schedules
		- Page has 2 sections: single schedule view + list of past schedules
		- Single schedule view shows schedule of meals across different days + has ability to edit any individual meal item, cancel a meal, or add lunch/dinner on any day
		- Below this, show a list of past schedules. Clicking on any of the schedule list items, "selects" the schedule to be shown in the main schedule view
		- It should be possible to 'delete' a schedule

# Data model
We will be using Postgres as the primary DB hosted via supabase

Please recommend the final table schemas needed. I think we'll need at least the following tables:
- Users: Supabase has already created a table for users, `auth.users` that I don't want to modify. Feel free to suggest any additional tables needed for user-specific behavior (eg tying users to their items / schedules)
- meal_item
	- Represents a single meal item (main or side)
	- Each meal_item can have some tags (tag sets are per-user). Figure out the required data model for this. Tag lists are user-specific (not shared between users)
	- meal_items are user-specific (not publicly available for now)
- schedule
	- Represents a created schedule
	- Will probably need a host of related tables to handle different days, meals on different days, and associated items
	- Schedules are user-specific (not shared)


# Code framework / scaffolding
- Please use a react-based scaffolding including build configuration
	- Prefer npm / package.json
	- Prefer vite
	- npm scripts should include dev, preview, and build commands
	- Use TypeScript
- Please implement auth with supabase auth (I already have created a supabase project with auth enabled)
- There is no backend other than API calls for CRUD operations against the Postgres db hosted via Supabase. Logic like creating the schedule should live in a react components, or ideally a functional / modular library file. Don't use any ORM, we'll use the supabase client library
- If possible, would be great to use a UI framework with a great off-the-shelf theme. Pick a vibrant, unique color scheme
- FWIW, I'm a software engineer and this isn't my first app, so assume I know quite a bit about how things work

# Deployment
- I already have a supabase project created, so assume I have all required Supabase environment variables
- I will deploy the SPA on Netlify, and I'll handle everything assuming `npm run build` generates a directory of files to be statically hosted



# Clarifications after LLM conversation

*Agent*
Thanks for sharing all these details! Before I dive into a full implementation, here are some clarifying questions I’d love to confirm:

1. **Tag data model**  
   - You mentioned tags are user-specific. Do you envision storing tags in a single table (`tag`) that has a `user_id` field, or do you just want to store them as a text field in a many-to-many join table with `meal_item`?  
   - Similarly, do you want the app to suggest *existing* tags a user has used (i.e., an auto-complete from the user’s “tag” table), or do you want free-form text for tags?

2. **Handling multi-select tags**  
   - Is your expectation that each `meal_item` can have multiple tags? If so, do you want to model that in a separate table (`meal_item_tag`) that associates a `meal_item` row with multiple `tag` rows?

3. **Schedule structure**  
   - You mentioned storing a schedule that can have multiple days, and each day can have multiple meals (e.g., lunch/dinner). Do you prefer:
     1. A single `schedule` table with an array or JSON field to represent day-meal assignments?  
     2. A `schedule_day` table (with `date` and a FK to `schedule`) plus a `schedule_meal` table for each meal?  
     3. Another approach?

4. **Meal representation in a schedule**  
   - Each meal has exactly one “main” and optionally one “side,” correct? Do you want that captured with two FKs on a single `schedule_meal` record (e.g., `main_meal_item_id` and `side_meal_item_id`)?

5. **Lunch / Dinner labeling**  
   - For a given day, do you want to store whether a scheduled meal is “lunch” vs “dinner” in a column (e.g. `meal_type` enum), or do you want a separate approach?

6. **Tag-based restrictions**  
   - During schedule creation, the user can specify that certain tags should not appear together on the same day. Is that a one-time input for each new schedule, or do you see storing it somewhere in the DB as a per-user preference?

7. **Supabase auth**  
   - You mentioned using `auth.users`. Do you already have the user’s ID available on the client side after they log in (via the Supabase session), and we should store that in each of these new tables to link them to a user?

8. **Any other preferences**  
   - Regarding the UI library and theme, do you have a preference (e.g., Material UI, Chakra UI, Mantine, etc.)? Or is this purely my choice to go with anything that looks vibrant and unique?  
   - For the “effort” scale (1 to 3), do you prefer an integer in the DB or a more descriptive enumeration?

Any clarifications around those topics (or anything else you think might be missing) will help ensure the final code aligns perfectly with your vision! Let me know what you think.

*User*
1. I think a tag table with user_id makes the most sense. And yes, please add auto-complete for tags based on the tag table
2. yes, meal_items can have multiple tags so your suggestion on a separate meal_item_tag table will be needed
3. I prefer option 2 with a schedule_day table plus whatever is required to represent which meals are on each day
4. Thanks for clarifying, each meal has exactly one main and one side. Don't enforce this with an FK constraint as I can see this potentially being configurable in the future
5. Good question, yes each scheduled meal should be assigned to lunch or dinner
6. Good question, store it in the DB somewhere, maybe like a user preferences table
7. Yes, after authenticating with Supabase Auth in a React app, you can access the user ID on the frontend
8. UI library, no preference, just something simple to understand and that looks great out of the box. For effort, let's do an integer in DB
