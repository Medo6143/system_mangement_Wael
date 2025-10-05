"use client";

import { useState, useEffect } from 'react';
import { supabase, Record } from '@/lib/supabase';
import { LogOut, BookOpen, Home as HomeIcon, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AuthForm } from '@/components/auth-form';
import { IncomeForm } from '@/components/income-form';
import { PreviousMonthArchiver } from '@/components/previous-month-archiver';
import { RecordsTable } from '@/components/records-table';
import { MonthlySummary } from '@/components/monthly-summary';
import { ArchivesView } from '@/components/archives-view';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'home' | 'archive' | 'archive-previous'>('home');
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 overflow-x-hidden">
        <header className="bg-white/80 backdrop-blur-sm border-b shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent truncate">
                تتبع دخل المعلم
              </h1>
              <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
                <Button
                  variant={view === 'home' ? 'default' : 'outline'}
                  onClick={() => setView('home')}
                  className={`flex-1 sm:flex-none ${view === 'home' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' : ''}`}
                  size="sm"
                >
                  <HomeIcon className="h-4 w-4 ml-2" />
                  <span className="hidden sm:inline">الرئيسية</span>
                </Button>
                <Button
                  variant={view === 'archive' ? 'default' : 'outline'}
                  onClick={() => setView('archive')}
                  className={`flex-1 sm:flex-none ${view === 'archive' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' : ''}`}
                  size="sm"
                >
                  <BookOpen className="h-4 w-4 ml-2" />
                  <span className="hidden sm:inline">الأرشيف</span>
                </Button>
                <Button variant="outline" onClick={handleSignOut} className="flex-1 sm:flex-none border-2" size="sm">
                  <LogOut className="h-4 w-4 ml-2" />
                  <span className="hidden sm:inline">خروج</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8 min-h-[calc(100vh-80px)] overflow-x-hidden">
          {/* Demo section for testing toasts */}
          <div className="bg-white hidden rounded-lg shadow-lg p-4 sm:p-6 overflow-hidden">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">تجربة الإشعارات</h2>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Button onClick={showSuccessToast} className="bg-green-600 hover:bg-green-700 text-sm">
                نجاح
              </Button>
              <Button onClick={showErrorToast} className="bg-red-600 hover:bg-red-700 text-sm">
                خطأ
              </Button>
              <Button onClick={showWarningToast} className="bg-yellow-600 hover:bg-yellow-700 text-sm">
                تحذير
              </Button>
              <Button onClick={showInfoToast} className="bg-blue-600 hover:bg-blue-700 text-sm">
                معلومة
              </Button>
            </div>
          </div>

          {view === 'home' ? (
            <>
              <IncomeForm onRecordAdded={fetchRecords} />
              <MonthlySummary records={records} onArchiveComplete={fetchRecords} />
              <RecordsTable records={records} />

              {/* قسم أرشفة الشهور القديمة */}
              <Card className="border-none shadow-lg bg-gradient-to-br from-white via-blue-50 to-indigo-50 overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                    <Archive className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    أرشفة الشهور القديمة
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    أرشفة الأشهر السابقة التي تحتوي على سجلات غير مؤرشفة بعد
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start lg:items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                        إذا كان لديك شهور سابقة تحتوي على سجلات يومية، يمكنك أرشفتها هنا لحفظ البيانات وتنظيم السجلات
                      </p>
                      <p className="text-xs sm:text-sm text-slate-500">
                        سيتم نقل جميع السجلات الخاصة بالشهر المحدد إلى الأرشيف مع الحفاظ على جميع الإحصائيات والتفاصيل
                      </p>
                    </div>
                    <Button
                      onClick={() => setView('archive-previous')}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium px-4 sm:px-6 py-2 sm:py-3 shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
                      size="default"
                    >
                      <Archive className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                      ابدأ أرشفة الشهور القديمة
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : view === 'archive' ? (
            <ArchivesView />
          ) : (
            <PreviousMonthArchiver />
          )}
        </main>
      </div>
    </>
  );
}
