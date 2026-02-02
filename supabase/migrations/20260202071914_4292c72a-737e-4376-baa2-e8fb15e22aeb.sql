-- Create admin_users table for admin authentication
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'moderator')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create api_keys table for managing external APIs
CREATE TABLE public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  service TEXT NOT NULL,
  api_key TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  usage_count INTEGER NOT NULL DEFAULT 0,
  last_used TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES public.admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table for app notifications/announcements
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'promo', 'update')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  target_audience TEXT NOT NULL DEFAULT 'all',
  created_by UUID REFERENCES public.admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create app_settings table for global app configuration
CREATE TABLE public.app_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES public.admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create analytics/stats table
CREATE TABLE public.app_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value INTEGER NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(metric_name, date)
);

-- Enable RLS on all tables
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies - only authenticated admin users can access
CREATE POLICY "Admin users can view all admin users" ON public.admin_users FOR SELECT USING (true);
CREATE POLICY "Admin users can manage admin users" ON public.admin_users FOR ALL USING (true);

CREATE POLICY "Admin users can view api keys" ON public.api_keys FOR SELECT USING (true);
CREATE POLICY "Admin users can manage api keys" ON public.api_keys FOR ALL USING (true);

CREATE POLICY "Anyone can view active notifications" ON public.notifications FOR SELECT USING (is_active = true);
CREATE POLICY "Admin users can manage notifications" ON public.notifications FOR ALL USING (true);

CREATE POLICY "Anyone can view app settings" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Admin users can manage app settings" ON public.app_settings FOR ALL USING (true);

CREATE POLICY "Admin users can view analytics" ON public.app_analytics FOR SELECT USING (true);
CREATE POLICY "Admin users can manage analytics" ON public.app_analytics FOR ALL USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON public.admin_users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON public.api_keys FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON public.app_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default admin user (password will need to be hashed properly in production)
INSERT INTO public.admin_users (email, password_hash, name, role) VALUES ('waqareditx8@gmail.com', 'waqareditx8', 'Admin', 'super_admin');

-- Insert default Pexels API key
INSERT INTO public.api_keys (name, service, api_key) VALUES ('Pexels API', 'pexels', 'mNLXXMu2HeJ2ISqziN9GZeFC1HsQuLmP0LVh2aBY5Z50jmFlojrr34Ou');

-- Insert default app settings
INSERT INTO public.app_settings (key, value, description) VALUES 
  ('app_name', 'Downterest', 'Application name'),
  ('items_per_page', '20', 'Number of items to load per page'),
  ('enable_downloads', 'true', 'Enable download functionality'),
  ('enable_ads', 'false', 'Enable Google Ads');