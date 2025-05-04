-- Create coins table
CREATE TABLE coins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    acquisition_date TIMESTAMP WITH TIME ZONE NOT NULL,
    purchase_price DECIMAL(10,2) NOT NULL,
    current_value DECIMAL(10,2) NOT NULL,
    roi DECIMAL(5,2) NOT NULL,
    description TEXT,
    grade TEXT,
    mint TEXT,
    year INTEGER,
    is_sold BOOLEAN DEFAULT FALSE,
    sold_price DECIMAL(10,2),
    sold_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_coins_name ON coins(name);
CREATE INDEX idx_coins_acquisition_date ON coins(acquisition_date);
CREATE INDEX idx_coins_is_sold ON coins(is_sold);

-- Enable Row Level Security (RLS)
ALTER TABLE coins ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (we'll update this when we add authentication)
CREATE POLICY "Enable all operations for all users" ON coins
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_coins_updated_at
    BEFORE UPDATE ON coins
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 