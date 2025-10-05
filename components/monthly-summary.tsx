"use client";

import { Archive, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Record, supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ar } from 'date-fns/locale';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import React, { useMemo, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export function MonthlySummary({ records, onArchiveComplete }: { records: Record[], onArchiveComplete: () => void }) {
  const [archiving, setArchiving] = useState(false);
  const { toast } = useToast();
  const currentDate = new Date();
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const monthlyRecords = records.filter((record) => {
    const recordDate = new Date(record.date);
    return recordDate >= monthStart && recordDate <= monthEnd;
  });

  const monthlyStats = useMemo(() => {
    const totalStudents = monthlyRecords.reduce((sum, record) => sum + record.students_count, 0);
    const totalTeacherProfit = monthlyRecords.reduce((sum, record) => sum + Number(record.teacher_profit), 0);
    const totalSchoolProfit = monthlyRecords.reduce((sum, record) => sum + Number(record.school_profit), 0);
    const totalIncome = monthlyRecords.reduce((sum, record) => sum + Number(record.total), 0);

    return {
      totalStudents,
      totalTeacherProfit,
      totalSchoolProfit,
      totalIncome,
    };
  }, [monthlyRecords]);

  const chartData = useMemo(() => {
    const dataMap = new Map<string, { date: string; teacherProfit: number; schoolProfit: number }>();

    monthlyRecords.forEach((record) => {
      const dateKey = record.date;
      const existing = dataMap.get(dateKey);

      if (existing) {
        existing.teacherProfit += Number(record.teacher_profit);
        existing.schoolProfit += Number(record.school_profit);
      } else {
        dataMap.set(dateKey, {
          date: format(new Date(record.date), 'd MMM', { locale: ar }),
          teacherProfit: Number(record.teacher_profit),
          schoolProfit: Number(record.school_profit),
        });
      }
    });

    return Array.from(dataMap.values()).sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [monthlyRecords]);

  const handleArchive = async () => {
    if (monthlyRecords.length === 0) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'لا توجد سجلات لأرشفتها هذا الشهر',
      });
      return;
    }

    setArchiving(true);

    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({
          variant: 'destructive',
          title: 'خطأ',
          description: 'يجب تسجيل الدخول أولاً',
        });
        setArchiving(false);
        return;
      }

      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      // Check if month is already archived
      const { error: checkError, data: existingArchive } = await supabase
        .from('archives')
        .select('id')
        .eq('user_id', user.id)
        .eq('month', month)
        .eq('year', year)
        .maybeSingle();

      if (existingArchive) {
        toast({
          variant: 'destructive',
          title: 'خطأ',
          description: 'تم أرشفة هذا الشهر مسبقاً',
        });
        setArchiving(false);
        return;
      }

      // Archive current month data
      const { error } = await supabase.from('archives').insert({
        user_id: user.id,
        month,
        year,
        total_students: monthlyStats.totalStudents,
        total_teacher_profit: monthlyStats.totalTeacherProfit,
        total_school_profit: monthlyStats.totalSchoolProfit,
        total_income: monthlyStats.totalIncome,
        records_data: monthlyRecords,
      });

      if (error) {
        toast({
          variant: 'destructive',
          title: 'خطأ',
          description: error.message,
        });
        setArchiving(false);
        return;
      }

      // Delete all existing records to start fresh
      const { error: deleteError } = await supabase
        .from('records')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (deleteError) {
        toast({
          variant: 'destructive',
          title: 'تحذير',
          description: 'تم أرشفة الشهر ولكن فشل حذف السجلات القديمة',
        });
      } else {
        toast({
          title: 'نجح',
          description: 'تم حذف جميع السجلات القديمة وبدء شهر جديد!',
        });
      }

      toast({
        title: 'نجح',
        description: 'تم أرشفة الشهر بنجاح!',
      });

      onArchiveComplete();

    } catch (error) {
      console.error('Archive error:', error);
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'حدث خطأ غير متوقع أثناء الأرشفة',
      });
    } finally {
      setArchiving(false);
    }
  };

  return (
    <Card className="border-none shadow-lg bg-gradient-to-br from-white via-white to-blue-50 w-full overflow-hidden">
      <CardHeader className="pb-4 sm:pb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-xl sm:text-2xl">الملخص الشهري</CardTitle>
            <CardDescription className="text-sm sm:text-base mt-1">{format(currentDate, 'MMMM yyyy', { locale: ar })}</CardDescription>
          </div>
          {monthlyRecords.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  disabled={archiving}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm sm:text-base w-full sm:w-auto"
                >
                  {archiving ? (
                    <>
                      <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                      جاري الأرشفة وحذف السجلات...
                    </>
                  ) : (
                    <>
                      <Archive className="h-4 w-4 ml-2" />
                      أرشفة وبدء شهر جديد
                    </>
                  )}
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="sm:max-w-md mx-4">
                <AlertDialogHeader>
                  <AlertDialogTitle>تأكيد الأرشفة</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p>سيتم حفظ بيانات الشهر الحالي في الأرشيف وحذف جميع السجلات الموجودة.</p>
                    <p className="font-semibold text-destructive">هذا الإجراء لا يمكن التراجع عنه!</p>
                    <p>هل أنت متأكد من أنك تريد المتابعة؟</p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-row-reverse gap-2">
                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleArchive}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  >
                    نعم، أرشف وبدء شهر جديد
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="space-y-2 p-4 sm:p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs sm:text-sm font-medium text-slate-600">إجمالي الطلاب</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900">{monthlyStats.totalStudents}</p>
          </div>
          <div className="space-y-2 p-4 sm:p-6 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border border-green-200 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs sm:text-sm font-medium text-green-700">ربحك</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-900">{monthlyStats.totalTeacherProfit.toFixed(2)} ج.م</p>
          </div>
          <div className="space-y-2 p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-cyan-100 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs sm:text-sm font-medium text-blue-700">ربح المدرسة</p>
            <p className="text-2xl sm:text-3xl font-bold text-blue-900">{monthlyStats.totalSchoolProfit.toFixed(2)} ج.م</p>
          </div>
          <div className="space-y-2 p-4 sm:p-6 bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl border border-amber-200 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs sm:text-sm font-medium text-amber-700">إجمالي الدخل</p>
            <p className="text-2xl sm:text-3xl font-bold text-amber-900">{monthlyStats.totalIncome.toFixed(2)} ج.م</p>
          </div>
        </div>

        {chartData.length > 0 && (
          <div className="w-full h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(2)} ج.م`, '']}
                  labelStyle={{ color: '#334155' }}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
                <Legend />
                <Bar dataKey="teacherProfit" fill="#10b981" name="ربح المعلم" />
                <Bar dataKey="schoolProfit" fill="#3b82f6" name="ربح المدرسة" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
