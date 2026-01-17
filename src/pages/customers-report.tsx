import { useState } from "react";
import { useCustomersReport, useTopCustomers, useUpdateUser, exportCustomersToExcel } from "@/hooks/use-data";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Download, TrendingUp, TrendingDown, Trophy, Users, Medal, ChevronLeft, ChevronRight, Pencil, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatLiters } from "@/lib/format";

interface CustomerToEdit {
    id: number;
    fullName: string | null;
    phone: string | null;
    balanceLiters: string;
}

export default function CustomersReportPage() {
    const [order, setOrder] = useState<"desc" | "asc">("desc");
    const [page, setPage] = useState(1);
    const limit = 50;
    const { data: customersData, isLoading } = useCustomersReport(order, page, limit);
    const { data: top10 } = useTopCustomers("desc", 10);
    const { data: bottom10 } = useTopCustomers("asc", 10);
    const { toast } = useToast();
    const { user: currentUser } = useAuth();
    const [exporting, setExporting] = useState(false);

    // Tahrirlash uchun
    const [editCustomer, setEditCustomer] = useState<CustomerToEdit | null>(null);
    const [editForm, setEditForm] = useState({ fullName: "", phone: "", balanceLiters: "" });
    const updateUser = useUpdateUser();

    const customers = customersData?.data || [];
    const pagination = customersData?.pagination;
    const isModerator = currentUser?.role === "moderator";

    const handleExport = async () => {
        setExporting(true);
        try {
            await exportCustomersToExcel();
            toast({ title: "Muvaffaqiyat", description: "Excel fayl yuklab olindi" });
        } catch (error) {
            toast({ title: "Xatolik", description: "Excel yuklab olishda xatolik", variant: "destructive" });
        } finally {
            setExporting(false);
        }
    };

    const openEditDialog = (customer: CustomerToEdit) => {
        setEditCustomer(customer);
        setEditForm({
            fullName: customer.fullName || "",
            phone: customer.phone || "",
            balanceLiters: customer.balanceLiters || "0",
        });
    };

    const handleSaveCustomer = () => {
        if (!editCustomer) return;

        const updateData: any = {
            fullName: editForm.fullName || undefined,
            phone: editForm.phone || undefined,
        };

        // Moderator balanceLiters ni tahrirlay olmaydi
        if (!isModerator) {
            updateData.balanceLiters = parseFloat(editForm.balanceLiters) || 0;
        }

        updateUser.mutate(
            {
                id: editCustomer.id,
                data: updateData,
            },
            {
                onSuccess: () => {
                    setEditCustomer(null);
                    toast({ title: "Muvaffaqiyat", description: "Mijoz ma'lumotlari yangilandi" });
                },
            }
        );
    };

    const getMedalColor = (index: number) => {
        if (index === 0) return "text-yellow-500";
        if (index === 1) return "text-gray-400";
        if (index === 2) return "text-amber-600";
        return "text-muted-foreground";
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-display font-bold tracking-tight">Mijozlar hisoboti</h2>
                    <p className="text-muted-foreground mt-1">Barcha mijozlar statistikasi va TOP-10</p>
                </div>
                <Button onClick={handleExport} disabled={exporting}>
                    <Download className="h-4 w-4 mr-2" />
                    {exporting ? "Yuklanmoqda..." : "Excel'ga eksport"}
                </Button>
            </div>

            <Tabs defaultValue="top10" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="top10" className="flex items-center gap-2"><Trophy className="h-4 w-4" />TOP-10</TabsTrigger>
                    <TabsTrigger value="all" className="flex items-center gap-2"><Users className="h-4 w-4" />Barcha mijozlar</TabsTrigger>
                </TabsList>

                <TabsContent value="top10">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-green-500" />Eng ko'p sotib olganlar</CardTitle>
                                <CardDescription>TOP-10 mijozlar</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {top10?.map((customer, index) => (
                                        <div key={customer.id} className={`flex items-center justify-between p-3 rounded-lg border ${index < 3 ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200" : "bg-slate-50"}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${index < 3 ? "bg-white shadow-sm" : "bg-slate-200"}`}>
                                                    {index < 3 ? (<Medal className={`h-5 w-5 ${getMedalColor(index)}`} />) : (<span className="font-bold text-sm text-muted-foreground">{index + 1}</span>)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{customer.fullName || "Noma'lum"}</p>
                                                    <p className="text-xs text-muted-foreground">{customer.phone || "-"}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-green-600">{formatLiters(customer.balanceLiters)} L</p>
                                                <p className="text-xs text-muted-foreground">{customer._count?.usedChecks || 0} chek</p>
                                            </div>
                                        </div>
                                    ))}
                                    {(!top10 || top10.length === 0) && (<p className="text-center text-muted-foreground py-4">Mijozlar yo'q</p>)}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><TrendingDown className="h-5 w-5 text-orange-500" />Eng kam sotib olganlar</CardTitle>
                                <CardDescription>Oxirgi 10 mijoz</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {bottom10?.map((customer, index) => (
                                        <div key={customer.id} className="flex items-center justify-between p-3 rounded-lg border bg-orange-50/50 border-orange-100">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100">
                                                    <span className="font-bold text-sm text-orange-600">{index + 1}</span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{customer.fullName || "Noma'lum"}</p>
                                                    <p className="text-xs text-muted-foreground">{customer.phone || "-"}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-orange-600">{formatLiters(customer.balanceLiters)} L</p>
                                                <p className="text-xs text-muted-foreground">{customer._count?.usedChecks || 0} chek</p>
                                            </div>
                                        </div>
                                    ))}
                                    {(!bottom10 || bottom10.length === 0) && (<p className="text-center text-muted-foreground py-4">Mijozlar yo'q</p>)}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="all">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Barcha mijozlar</CardTitle>
                                    <CardDescription>Jami: {pagination?.total || 0} ta mijoz</CardDescription>
                                </div>
                                <Select value={order} onValueChange={(v) => { setOrder(v as "desc" | "asc"); setPage(1); }}>
                                    <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="desc"><div className="flex items-center gap-2"><TrendingDown className="h-4 w-4" />Eng ko'p → Eng kam</div></SelectItem>
                                        <SelectItem value="asc"><div className="flex items-center gap-2"><TrendingUp className="h-4 w-4" />Eng kam → Eng ko'p</div></SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">№</TableHead>
                                        <TableHead>F.I.O</TableHead>
                                        <TableHead>Telefon</TableHead>
                                        <TableHead className="text-right">Balans (L)</TableHead>
                                        <TableHead className="text-right">Cheklar</TableHead>
                                        <TableHead className="w-16">Amal</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow><TableCell colSpan={6} className="text-center py-8">Yuklanmoqda...</TableCell></TableRow>
                                    ) : customers?.length === 0 ? (
                                        <TableRow><TableCell colSpan={6} className="text-center py-8">Mijozlar yo'q</TableCell></TableRow>
                                    ) : (
                                        customers?.map((customer, index) => {
                                            const globalIndex = (page - 1) * limit + index;
                                            return (
                                                <TableRow key={customer.id}>
                                                    <TableCell>{globalIndex < 3 ? (<Badge variant={globalIndex === 0 ? "default" : "secondary"} className="w-8 justify-center">{globalIndex + 1}</Badge>) : (globalIndex + 1)}</TableCell>
                                                    <TableCell className="font-medium">{customer.fullName || "-"}</TableCell>
                                                    <TableCell>{customer.phone || "-"}</TableCell>
                                                    <TableCell className="text-right font-semibold">{formatLiters(customer.balanceLiters)}</TableCell>
                                                    <TableCell className="text-right">{customer._count?.usedChecks || 0}</TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => openEditDialog(customer)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>

                            {pagination && pagination.totalPages > 1 && (
                                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                    <p className="text-sm text-muted-foreground">
                                        Sahifa {pagination.page} / {pagination.totalPages}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4 mr-1" />
                                            Oldingi
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                                            disabled={page >= pagination.totalPages}
                                        >
                                            Keyingi
                                            <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Mijozni tahrirlash dialogi */}
            <Dialog open={!!editCustomer} onOpenChange={(open) => !open && setEditCustomer(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Mijozni tahrirlash</DialogTitle>
                        <DialogDescription>Mijoz ma'lumotlarini o'zgartiring</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <label className="text-sm font-medium">F.I.O</label>
                            <Input
                                value={editForm.fullName}
                                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                                placeholder="Ism Familiya"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Telefon</label>
                            <Input
                                value={editForm.phone}
                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                placeholder="+998901234567"
                            />
                        </div>
                        {!isModerator && (
                            <div>
                                <label className="text-sm font-medium">Balans (Litr)</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={editForm.balanceLiters}
                                    onChange={(e) => setEditForm({ ...editForm, balanceLiters: e.target.value })}
                                    placeholder="0.00"
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditCustomer(null)}>
                            Bekor qilish
                        </Button>
                        <Button onClick={handleSaveCustomer} disabled={updateUser.isPending}>
                            {updateUser.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Saqlash
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
