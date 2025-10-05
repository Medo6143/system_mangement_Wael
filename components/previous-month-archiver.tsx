"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Archive, Calendar, Loader2, CheckCircle } from 'lucide-react';
import { Record, Archive as ArchiveType, supabase } from '@/lib/supabase';
import { format, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

interface MonthlyData {
  month: number;
  year: number;
  records: Record[];
  totalStudents: number;
  totalTeacherProfit: number;
  totalSchoolProfit: number;
  totalIncome: number;
  isArchived: boolean;
}

export function PreviousMonthArchiver() {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [archiving, setArchiving] = useState<Set<string>>(new Set());
  const [selectedMonths, setSelectedMonths] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    loadMonthlyData();
  }, []);

  const loadMonthlyData = async () => {
    setLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all records
      const { data: records, error: recordsError } = await supabase
        .from('records')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (recordsError) throw recordsError;

      // Get existing archives
      const { data: archives, error: archivesError } = await supabase
        .from('archives')
        .select('month, year')
        .eq('user_id', user.id);

      if (archivesError) throw archivesError;

      // Group records by month and year
      const monthlyMap = new Map<string, Record[]>();
      const archivedSet = new Set(archives?.map(a => `${a.year}-${a.month}`) || []);

      records?.forEach(record => {
        const recordDate = new Date(record.date);
        const monthKey = `${recordDate.getFullYear()}-${recordDate.getMonth() + 1}`;

        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, []);
        }
        monthlyMap.get(monthKey)!.push(record);
      });

      // Convert to MonthlyData array
      const monthlyDataArray: MonthlyData[] = Array.from(monthlyMap.entries()).map(([monthKey, records]) => {
        const [year, month] = monthKey.split('-').map(Number);
        const totalStudents = records.reduce((sum, r) => sum + r.students_count, 0);
        const totalTeacherProfit = records.reduce((sum, r) => sum + Number(r.teacher_profit), 0);
        const totalSchoolProfit = records.reduce((sum, r) => sum + Number(r.school_profit), 0);
        const totalIncome = records.reduce((sum, r) => sum + Number(r.total), 0);

        return {
          month,
          year,
          records,
          totalStudents,
          totalTeacherProfit,
          totalSchoolProfit,
          totalIncome,
          isArchived: archivedSet.has(monthKey),
        };
      }).sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });

      setMonthlyData(monthlyDataArray);
    } catch (error) {
      console.error('Error loading monthly data:', error);
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'فشل في تحميل بيانات الأشهر',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMonthSelection = (monthKey: string, selected: boolean) => {
    const newSelected = new Set(selectedMonths);
    if (selected) {
      newSelected.add(monthKey);
    } else {
      newSelected.delete(monthKey);
    }
    setSelectedMonths(newSelected);
  };

  const handleArchiveSelected = async () => {
    if (selectedMonths.size === 0) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'يرجى اختيار شهر واحد على الأقل للأرشفة',
      });
      return;
    }

    setArchiving(new Set(selectedMonths));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const results = [];

      for (const monthKey of Array.from(selectedMonths)) {
        const [year, month] = monthKey.split('-').map(Number);
        const monthData = monthlyData.find(m => m.year === year && m.month === month);

        if (!monthData || monthData.isArchived) continue;

        // Check if already archived
        const { data: existingArchive } = await supabase
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
            description: `الشهر ${format(new Date(year, month - 1), 'MMMM yyyy', { locale: ar })} مُؤرشف بالفعل`,
          });
          continue;
        }

        // Create archive
        const { error } = await supabase.from('archives').insert({
          user_id: user.id,
          month,
          year,
          total_students: monthData.totalStudents,
          total_teacher_profit: monthData.totalTeacherProfit,
          total_school_profit: monthData.totalSchoolProfit,
          total_income: monthData.totalIncome,
          records_data: monthData.records,
        });

        if (error) throw error;

        results.push(`تم أرشفة ${format(new Date(year, month - 1), 'MMMM yyyy', { locale: ar })}`);
      }

      toast({
        title: 'نجح',
        description: `تم أرشفة ${results.length} شهر بنجاح!`,
      });

      // Refresh data
      await loadMonthlyData();
      setSelectedMonths(new Set());

    } catch (error) {
      console.error('Archive error:', error);
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'فشل في أرشفة الأشهر المحددة',
      });
    } finally {
      setArchiving(new Set());
    }
  };

  const getMonthName = (month: number, year: number) => {
    return format(new Date(year, month - 1), 'MMMM yyyy', { locale: ar });
  };

  if (loading) {
    return (
      <Card className="border-none shadow-lg">
        <CardContent className="py-8">
          <p className="text-center text-slate-600">جاري التحميل...</p>
        </CardContent>
      </Card>
    );
  }

  const unarchivedMonths = monthlyData.filter(m => !m.isArchived);

  if (unarchivedMonths.length === 0) {
    return (
      <Card className="border-none shadow-lg bg-gradient-to-br from-white to-slate-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Archive className="h-6 w-6" />
            أرشفة الأشهر السابقة
          </CardTitle>
          <CardDescription>أرشفة الأشهر التي تحتوي على سجلات غير مؤرشفة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-slate-500">جميع الأشهر مؤرشفة بالفعل!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-lg bg-gradient-to-br from-white to-slate-50 w-full">
      <CardHeader className="pb-4 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
          <Archive className="h-5 w-5 sm:h-6 sm:w-6" />
          أرشفة الأشهر السابقة
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          أرشفة الأشهر التي تحتوي على سجلات غير مؤرشفة
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <p className="text-sm text-slate-600 flex-1">
            اختر الأشهر التي تريد أرشفتها ({selectedMonths.size} محدد)
          </p>
          <Button
            onClick={handleArchiveSelected}
            disabled={selectedMonths.size === 0 || archiving.size > 0}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 w-full sm:w-auto"
            size="default"
          >
            {archiving.size > 0 ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                جاري الأرشفة...
              </>
            ) : (
              <>
                <Archive className="h-4 w-4 ml-2" />
                أرشفة المحدد ({selectedMonths.size})
              </>
            )}
          </Button>
        </div>

        <div className="space-y-3 sm:space-y-4 max-h-[60vh] overflow-y-auto">
          {unarchivedMonths.map((monthData) => {
            const monthKey = `${monthData.year}-${monthData.month}`;
            const isArchiving = archiving.has(monthKey);

            return (
              <Card key={monthKey} className="border-2 hover:border-blue-300 transition-colors overflow-hidden">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                    <Checkbox
                      id={monthKey}
                      checked={selectedMonths.has(monthKey)}
                      onCheckedChange={(checked) => handleMonthSelection(monthKey, checked as boolean)}
                      disabled={isArchiving}
                      className="mt-1 sm:mt-0 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <Calendar className="h-4 w-4 text-slate-500 flex-shrink-0" />
                        <h3 className="font-semibold text-base sm:text-lg truncate">{getMonthName(monthData.month, monthData.year)}</h3>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 text-xs sm:text-sm">
                        <div className="bg-slate-50 p-2 sm:p-3 rounded-lg">
                          <p className="text-slate-600">السجلات</p>
                          <p className="font-semibold">{monthData.records.length}</p>
                        </div>
                        <div className="bg-blue-50 p-2 sm:p-3 rounded-lg">
                          <p className="text-blue-600">إجمالي الطلاب</p>
                          <p className="font-semibold">{monthData.totalStudents}</p>
                        </div>
                        <div className="bg-green-50 p-2 sm:p-3 rounded-lg">
                          <p className="text-green-600">ربحك</p>
                          <p className="font-semibold text-xs sm:text-sm">{monthData.totalTeacherProfit.toFixed(2)} ج.م</p>
                        </div>
                        <div className="bg-amber-50 p-2 sm:p-3 rounded-lg">
                          <p className="text-amber-600">إجمالي الدخل</p>
                          <p className="font-semibold text-xs sm:text-sm">{monthData.totalIncome.toFixed(2)} ج.م</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {isArchiving && (
                    <div className="mt-3 sm:mt-4 flex items-center gap-2 text-blue-600">
                      <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
                      <span className="text-sm">جاري الأرشفة...</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
