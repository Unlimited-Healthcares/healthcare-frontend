import { useState } from 'react';
import { Button } from "./button";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { Badge } from './badge';

interface TestResult {
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
  latency?: number;
}

export function DatabaseConnectionTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  const runConnectionTest = async () => {
    setLoading(true);
    setResult(null);

    try {
      console.log('🔍 Testing database connection...');
      const startTime = Date.now();

      // Try a simple query to verify connection
      const { data, error, status } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      const endTime = Date.now();
      const latency = endTime - startTime;

      console.log(`🔍 Query status code: ${status}`);
      console.log(`🔍 Response time: ${latency}ms`);
      
      if (error) {
        console.error('❌ Database connection error:', error);
        setResult({
          success: false,
          message: `Connection failed: ${error.message}`,
          details: {
            code: error.code,
            hint: error.hint,
            details: error.details,
          },
          latency
        });
        toast.error("Database connection failed");
      } else {
        console.log('✅ Database connection successful!', data);
        setResult({
          success: true,
          message: 'Successfully connected to the database',
          details: { queryResult: data, recordCount: data?.length || 0 },
          latency
        });
        toast.success("Database connection successful!");
      }
    } catch (error: unknown) {
      console.error('❌ Exception during connection test:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setResult({
        success: false,
        message: `Exception: ${errorMessage}`,
        details: error instanceof Error ? { name: error.name, message: error.message } : { error }
      });
      toast.error("Database connection test threw an exception");
    } finally {
      setLoading(false);
    }
  };

  // Function to test basic Supabase auth to check if keys are valid
  const testAuthConnection = async () => {
    setLoading(true);
    try {
      console.log('🔍 Testing Supabase auth API connection...');
      const startTime = Date.now();
      
      // This just pings the auth API without requiring login
      const { data, error } = await supabase.auth.getSession();
      
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      if (error) {
        console.error('❌ Auth API connection error:', error);
        setResult({
          success: false,
          message: `Auth API failed: ${error.message}`,
          details: { 
            code: error.code || 'unknown',
            message: error.message
          },
          latency
        });
      } else {
        console.log('✅ Auth API connection successful!', data);
        setResult({
          success: true,
          message: 'Successfully connected to Auth API',
          details: {
            session: data.session ? 'Available' : 'Not available',
            apiWorking: true
          },
          latency
        });
      }
    } catch (error: unknown) {
      console.error('❌ Exception during auth test:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setResult({
        success: false,
        message: `Auth Exception: ${errorMessage}`,
        details: error instanceof Error ? { name: error.name, message: error.message } : { error }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 border p-4 rounded-lg">
      <h3 className="text-lg font-medium">Database Connection Test</h3>
      <div className="flex gap-2">
        <Button 
          onClick={runConnectionTest} 
          disabled={loading}
          variant="outline"
        >
          {loading ? 'Testing...' : 'Test Database Connection'}
        </Button>
        <Button 
          onClick={testAuthConnection} 
          disabled={loading}
          variant="outline"
        >
          {loading ? 'Testing...' : 'Test Auth API'}
        </Button>
      </div>

      {result && (
        <Alert variant={result.success ? "default" : "destructive"}>
          <AlertTitle className="flex items-center gap-2">
            {result.success ? 'Connection Successful' : 'Connection Failed'}
            <Badge variant={result.success ? "secondary" : "destructive"}>
              {result.latency ? `${result.latency}ms` : 'N/A'}
            </Badge>
          </AlertTitle>
          <AlertDescription>
            <div className="text-sm">
              <p>{result.message}</p>
              {result.details && (
                <pre className="mt-2 bg-muted p-2 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
} 