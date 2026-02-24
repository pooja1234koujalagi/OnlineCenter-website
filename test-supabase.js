const { createClient } = require('@supabase/supabase-js');

// Direct Supabase connection test
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function testUpload() {
  console.log('=== DIRECT SUPABASE TEST ===');
  
  try {
    // Test inserting with extraData column
    const { data, error } = await supabase
      .from('uploads')
      .insert([{
        user: 'Test User',
        useremail: 'test@example.com',
        filename: 'test-file.pdf',
        originalname: 'test-file.pdf',
        extraData: 'This is test extra information',
        uploadedat: new Date()
      }]);
    
    if (error) {
      console.error('Direct Supabase insert error:', error);
    } else {
      console.log('Direct Supabase insert success!');
      console.log('Inserted data:', data);
    }
    
    // Test querying to see if extraData is returned
    const { data: result, error: queryError } = await supabase
      .from('uploads')
      .select('*')
      .eq('useremail', 'test@example.com');
    
    if (queryError) {
      console.error('Direct Supabase query error:', queryError);
    } else {
      console.log('Direct Supabase query result:', result);
      console.log('extraData value:', result[0]?.extraData);
    }
    
  } catch (err) {
    console.error('Direct Supabase test error:', err);
  }
}

testUpload();
