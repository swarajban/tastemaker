-- 1. Tag Table
CREATE TABLE IF NOT EXISTS public.tag (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    name text NOT NULL,
    UNIQUE(user_id, name)
);

-- 2. meal_item Table
CREATE TABLE IF NOT EXISTS public.meal_item (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    title text NOT NULL,
    notes text,
    type text NOT NULL CHECK (type IN ('main', 'side')),
    effort int NOT NULL CHECK (effort BETWEEN 1 AND 3),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. meal_item_tag (linking table)
CREATE TABLE IF NOT EXISTS public.meal_item_tag (
    meal_item_id uuid NOT NULL REFERENCES public.meal_item (id) ON DELETE CASCADE,
    tag_id uuid NOT NULL REFERENCES public.tag (id) ON DELETE CASCADE,
    PRIMARY KEY (meal_item_id, tag_id)
);

-- 4. user_preferences Table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    tag_restrictions jsonb DEFAULT '[]'::jsonb
);

-- 5. schedule Table
CREATE TABLE IF NOT EXISTS public.schedule (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    start_date date NOT NULL,
    end_date date NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. schedule_day Table
CREATE TABLE IF NOT EXISTS public.schedule_day (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    schedule_id uuid NOT NULL REFERENCES public.schedule (id) ON DELETE CASCADE,
    day_date date NOT NULL,
    UNIQUE(schedule_id, day_date)
);

-- 7. schedule_meal Table
CREATE TABLE IF NOT EXISTS public.schedule_meal (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    schedule_day_id uuid NOT NULL REFERENCES public.schedule_day (id) ON DELETE CASCADE,
    meal_type text NOT NULL CHECK (meal_type IN ('lunch', 'dinner')),
    main_item_id uuid NOT NULL REFERENCES public.meal_item (id) ON DELETE SET NULL,
    side_item_id uuid NOT NULL REFERENCES public.meal_item (id) ON DELETE SET NULL,
    UNIQUE(schedule_day_id, meal_type)
);
