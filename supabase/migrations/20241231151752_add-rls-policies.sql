-- Enable RLS on all tables
ALTER TABLE public.tag ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_item_tag ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_day ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_meal ENABLE ROW LEVEL SECURITY;

-- Policies for tag table
CREATE POLICY "Users can view their own tags" ON public.tag
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own tags" ON public.tag
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tags" ON public.tag
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tags" ON public.tag
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for meal_item table
CREATE POLICY "Users can view their own meal items" ON public.meal_item
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own meal items" ON public.meal_item
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own meal items" ON public.meal_item
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own meal items" ON public.meal_item
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for meal_item_tag table
CREATE POLICY "Users can view their meal item tags" ON public.meal_item_tag
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.meal_item
            WHERE id = meal_item_id AND user_id = auth.uid()
        )
    );
CREATE POLICY "Users can manage their meal item tags" ON public.meal_item_tag
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.meal_item
            WHERE id = meal_item_id AND user_id = auth.uid()
        )
    );

-- Policies for user_preferences table
CREATE POLICY "Users can view their own preferences" ON public.user_preferences
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own preferences" ON public.user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own preferences" ON public.user_preferences
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own preferences" ON public.user_preferences
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for schedule table
CREATE POLICY "Users can view their own schedules" ON public.schedule
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own schedules" ON public.schedule
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own schedules" ON public.schedule
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own schedules" ON public.schedule
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for schedule_day table
CREATE POLICY "Users can view their schedule days" ON public.schedule_day
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.schedule
            WHERE id = schedule_id AND user_id = auth.uid()
        )
    );
CREATE POLICY "Users can manage their schedule days" ON public.schedule_day
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.schedule
            WHERE id = schedule_id AND user_id = auth.uid()
        )
    );

-- Policies for schedule_meal table
CREATE POLICY "Users can view their schedule meals" ON public.schedule_meal
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.schedule_day sd
            JOIN public.schedule s ON s.id = sd.schedule_id
            WHERE sd.id = schedule_day_id AND s.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can manage their schedule meals" ON public.schedule_meal
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.schedule_day sd
            JOIN public.schedule s ON s.id = sd.schedule_id
            WHERE sd.id = schedule_day_id AND s.user_id = auth.uid()
        )
    );
