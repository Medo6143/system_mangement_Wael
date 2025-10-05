"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Calendar as CalendarIcon } from 'lucide-react';

export function IncomeForm({ onRecordAdded }: { onRecordAdded: () => void }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [studentsCount, setStudentsCount] = useState('');
  const [pricePerStudent, setPricePerStudent] = useState('15');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const students = parseInt(studentsCount);
    const price = parseFloat(pricePerStudent);

    const teacherProfit = students * 12.5;
    const schoolProfit = students * 2.5;
    const total = students * price;

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'يجب تسجيل الدخول أولاً',
      });
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('records').insert({
      user_id: user.id,
      date,
      students_count: students,
      price_per_student: price,
      teacher_profit: teacherProfit,
      school_profit: schoolProfit,
      total,
    });

    setLoading(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: error.message,
      });
    } else {
      toast({
        title: 'نجح',
        description: 'تم إضافة السجل بنجاح!',
      });
      setStudentsCount('');
      setPricePerStudent('15');
      onRecordAdded();
    }
  };

  return (
    <Card className="border-none shadow-lg bg-gradient-to-br from-white via-white to-green-50">
      <CardHeader>
        <CardTitle className="text-2xl">إضافة سجل يومي</CardTitle>
        <CardDescription className="text-base">أدخل عدد الطلاب ليتم حساب الدخل</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">التاريخ</Label>
              <div className="relative">
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
                <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="students">عدد الطلاب</Label>
              <Input
                id="students"
                type="number"
                min="0"
                placeholder="0"
                value={studentsCount}
                onChange={(e) => setStudentsCount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">سعر الطالب (ج.م)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="15.00"
                value={pricePerStudent}
                onChange={(e) => setPricePerStudent(e.target.value)}
                required
              />
            </div>
          </div>
          {studentsCount && pricePerStudent && (
            <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700">ربح المعلم:</span>
                <span className="text-lg font-bold text-green-600">{(parseInt(studentsCount) * 12.5).toFixed(2)} ج.م</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700">ربح المدرسة:</span>
                <span className="text-lg font-bold text-blue-600">{(parseInt(studentsCount) * 2.5).toFixed(2)} ج.م</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-300 pt-3">
                <span className="text-base font-semibold text-slate-800">إجمالي الدخل:</span>
                <span className="text-2xl font-bold text-amber-600">{(parseInt(studentsCount) * parseFloat(pricePerStudent)).toFixed(2)} ج.م</span>
              </div>
            </div>
          )}
          <Button type="submit" className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg py-6" disabled={loading}>
            {loading ? 'جاري الإضافة...' : 'إضافة سجل'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
