"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Record } from '@/lib/supabase';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export function RecordsTable({ records }: { records: Record[] }) {
  const todayRecords = records.filter(
    (record) => record.date === new Date().toISOString().split('T')[0]
  );

  const todayTotal = todayRecords.reduce((sum, record) => sum + Number(record.total), 0);
  const todayTeacherProfit = todayRecords.reduce((sum, record) => sum + Number(record.teacher_profit), 0);
  const todayStudents = todayRecords.reduce((sum, record) => sum + record.students_count, 0);

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {todayRecords.length > 0 && (
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 shadow-lg overflow-hidden">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-lg sm:text-2xl text-blue-900">ملخص اليوم</CardTitle>
            <CardDescription className="text-sm sm:text-base text-blue-700">
              {format(new Date(), 'EEEE، d MMMM yyyy', { locale: ar })}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-2 p-3 sm:p-4 bg-white/50 rounded-lg">
                <p className="text-xs sm:text-sm font-medium text-blue-700">إجمالي الطلاب</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-900">{todayStudents}</p>
              </div>
              <div className="space-y-2 p-3 sm:p-4 bg-white/50 rounded-lg">
                <p className="text-xs sm:text-sm font-medium text-blue-700">ربحك</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-900">{todayTeacherProfit.toFixed(2)} ج.م</p>
              </div>
              <div className="space-y-2 p-3 sm:p-4 bg-white/50 rounded-lg">
                <p className="text-xs sm:text-sm font-medium text-blue-700">إجمالي الدخل</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-900">{todayTotal.toFixed(2)} ج.م</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-none shadow-lg bg-gradient-to-br from-white to-slate-50 w-full overflow-hidden">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-lg sm:text-2xl">السجلات اليومية</CardTitle>
          <CardDescription className="text-sm sm:text-base">عرض جميع سجلات الدخل</CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {records.length === 0 ? (
            <p className="text-center text-slate-500 py-6 sm:py-8 text-sm sm:text-base">لا توجد سجلات بعد. أضف سجلك الأول أعلاه!</p>
          ) : (
            <div className="rounded-xl border-2 border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-slate-100 to-slate-50">
                      <TableHead className="font-semibold text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4 min-w-[80px]">التاريخ</TableHead>
                      <TableHead className="text-right font-semibold text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4 min-w-[60px]">الطلاب</TableHead>
                      <TableHead className="text-right font-semibold text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4 min-w-[80px]">سعر الطالب</TableHead>
                      <TableHead className="text-right font-semibold text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4 min-w-[80px]">ربح المعلم</TableHead>
                      <TableHead className="text-right font-semibold text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4 min-w-[80px]">ربح المدرسة</TableHead>
                      <TableHead className="text-right font-semibold text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4 min-w-[80px]">الإجمالي</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((record) => (
                      <TableRow key={record.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell className="font-medium text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4">
                          {format(new Date(record.date), 'd MMM yyyy', { locale: ar })}
                        </TableCell>
                        <TableCell className="text-right text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4">{record.students_count}</TableCell>
                        <TableCell className="text-right text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4">{Number(record.price_per_student).toFixed(2)} ج.م</TableCell>
                        <TableCell className="text-right text-green-600 font-semibold text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4">
                          {Number(record.teacher_profit).toFixed(2)} ج.م
                        </TableCell>
                        <TableCell className="text-right text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4">{Number(record.school_profit).toFixed(2)} ج.م</TableCell>
                        <TableCell className="text-right font-bold text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4">
                          {Number(record.total).toFixed(2)} ج.م
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
