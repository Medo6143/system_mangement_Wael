"use client";

import { useState, useEffect } from 'react';
import { supabase, Record } from '@/lib/supabase';
import { LogOut, BookOpen, Home as HomeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AuthForm } from '@/components/auth-form';
import { IncomeForm } from '@/components/income-form';
import { RecordsTable } from '@/components/records-table';
import { MonthlySummary } from '@/components/monthly-summary';
import { ArchivesView } from '@/components/archives-view';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'home' | 'archive'>('home');
  const { toast } = useToast();

  useEffect(() => {
    checkUser();

    supabase.auth.onAuthStateChange((event, session) => {
      (() => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchRecords();
        }
      })();
    });
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      await fetchRecords();
    }
    setLoading(false);
  };

  const fetchRecords = async () => {
    const { data, error } = await supabase
      .from('records')
      .select('*')
      .order('date', { ascending: false });

    if (!error && data) {
      setRecords(data);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setRecords([]);
  };

  // Demo functions for testing toast notifications
  const showSuccessToast = () => {
    toast({
      title: "نجح!",
      description: "تم حفظ التغييرات بنجاح",
      variant: "success",
    });
  };

  const showErrorToast = () => {
    toast({
      title: "خطأ",
      description: "حدث خطأ ما. يرجى المحاولة مرة أخرى",
      variant: "error",
    });
  };

  const showWarningToast = () => {
    toast({
      title: "تحذير",
      description: "يرجى التحقق من البيانات المدخلة",
      variant: "warning",
    });
  };

  const showInfoToast = () => {
    toast({
      title: "معلومة",
      description: "هذه معلومة مفيدة لك",
      variant: "info",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-slate-600">جاري التحميل...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthForm onAuthSuccess={checkUser} />
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <header className="bg-white/80 backdrop-blur-sm border-b shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">تتبع دخل المعلم</h1>
              <div className="flex gap-3">
                <Button
                  variant={view === 'home' ? 'default' : 'outline'}
                  onClick={() => setView('home')}
                  className={view === 'home' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' : ''}
                >
                  <HomeIcon className="h-4 w-4 ml-2" />
                  الرئيسية
                </Button>
                <Button
                  variant={view === 'archive' ? 'default' : 'outline'}
                  onClick={() => setView('archive')}
                  className={view === 'archive' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' : ''}
                >
                  <BookOpen className="h-4 w-4 ml-2" />
                  الأرشيف
                </Button>
                <Button variant="outline" onClick={handleSignOut} className="border-2">
                  <LogOut className="h-4 w-4 ml-2" />
                  تسجيل خروج
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Demo section for testing toasts */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">تجربة الإشعارات</h2>
            <div className="flex flex-wrap gap-3">
              <Button onClick={showSuccessToast} className="bg-green-600 hover:bg-green-700">
                نجاح
              </Button>
              <Button onClick={showErrorToast} className="bg-red-600 hover:bg-red-700">
                خطأ
              </Button>
              <Button onClick={showWarningToast} className="bg-yellow-600 hover:bg-yellow-700">
                تحذير
              </Button>
              <Button onClick={showInfoToast} className="bg-blue-600 hover:bg-blue-700">
                معلومة
              </Button>
            </div>
          </div>

          {view === 'home' ? (
            <>
              <IncomeForm onRecordAdded={fetchRecords} />
              <MonthlySummary records={records} onArchiveComplete={fetchRecords} />
              <RecordsTable records={records} />
            </>
          ) : (
            <ArchivesView />
          )}
        </main>
      </div>
    </>
  );
}
