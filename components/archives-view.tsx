"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Archive as ArchiveType, supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Archive, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export function ArchivesView() {
  const [archives, setArchives] = useState<ArchiveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedArchive, setExpandedArchive] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchArchives();
  }, []);

  const fetchArchives = async () => {
    const { data, error } = await supabase
      .from('archives')
      .select('*')
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (!error && data) {
      setArchives(data);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('archives').delete().eq('id', id);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: error.message,
      });
    } else {
      toast({
        title: 'نجح',
        description: 'تم حذف الأرشيف بنجاح',
      });
      fetchArchives();
    }
  };

  const getMonthName = (month: number, year: number) => {
    const date = new Date(year, month - 1, 1);
    return format(date, 'MMMM yyyy', { locale: ar });
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

  if (archives.length === 0) {
    return (
      <Card className="border-none shadow-lg bg-gradient-to-br from-white to-slate-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Archive className="h-6 w-6" />
            الأرشيف
          </CardTitle>
          <CardDescription>عرض الأشهر المؤرشفة</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-slate-500 py-8">لا توجد أشهر مؤرشفة بعد</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-lg bg-gradient-to-br from-white to-slate-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Archive className="h-6 w-6" />
          الأرشيف
        </CardTitle>
        <CardDescription>عرض الأشهر المؤرشفة</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {archives.map((archive) => (
          <Collapsible
            key={archive.id}
            open={expandedArchive === archive.id}
            onOpenChange={() => setExpandedArchive(expandedArchive === archive.id ? null : archive.id)}
          >
            <Card className="overflow-hidden border-2 hover:border-blue-300 transition-colors">
              <CollapsibleTrigger className="w-full">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 transition-colors">
                  <div className="flex justify-between items-center">
                    <div className="text-right">
                      <CardTitle className="text-xl">{getMonthName(archive.month, archive.year)}</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {format(new Date(archive.created_at), 'd MMMM yyyy', { locale: ar })}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(archive.id);
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {expandedArchive === archive.id ? (
                        <ChevronUp className="h-5 w-5 text-slate-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-slate-600" />
                      )}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-6 space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                      <p className="text-sm font-medium text-slate-600">إجمالي الطلاب</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{archive.total_students}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg border border-green-200">
                      <p className="text-sm font-medium text-green-700">ربحك</p>
                      <p className="text-2xl font-bold text-green-900 mt-1">{Number(archive.total_teacher_profit).toFixed(2)} ج.م</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-100 rounded-lg border border-blue-200">
                      <p className="text-sm font-medium text-blue-700">ربح المدرسة</p>
                      <p className="text-2xl font-bold text-blue-900 mt-1">{Number(archive.total_school_profit).toFixed(2)} ج.م</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-100 rounded-lg border border-amber-200">
                      <p className="text-sm font-medium text-amber-700">إجمالي الدخل</p>
                      <p className="text-2xl font-bold text-amber-900 mt-1">{Number(archive.total_income).toFixed(2)} ج.م</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-lg mb-3 text-slate-900">السجلات اليومية</h4>
                    <div className="rounded-lg border border-slate-200 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50">
                            <TableHead>التاريخ</TableHead>
                            <TableHead className="text-right">الطلاب</TableHead>
                            <TableHead className="text-right">سعر الطالب</TableHead>
                            <TableHead className="text-right">ربح المعلم</TableHead>
                            <TableHead className="text-right">ربح المدرسة</TableHead>
                            <TableHead className="text-right">الإجمالي</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {archive.records_data.map((record, index) => (
                            <TableRow key={index} className="hover:bg-slate-50">
                              <TableCell className="font-medium">
                                {format(new Date(record.date), 'd MMM yyyy', { locale: ar })}
                              </TableCell>
                              <TableCell className="text-right">{record.students_count}</TableCell>
                              <TableCell className="text-right">{Number(record.price_per_student).toFixed(2)} ج.م</TableCell>
                              <TableCell className="text-right text-green-600 font-semibold">
                                {Number(record.teacher_profit).toFixed(2)} ج.م
                              </TableCell>
                              <TableCell className="text-right">{Number(record.school_profit).toFixed(2)} ج.م</TableCell>
                              <TableCell className="text-right font-semibold">
                                {Number(record.total).toFixed(2)} ج.م
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </CardContent>
    </Card>
  );
}
