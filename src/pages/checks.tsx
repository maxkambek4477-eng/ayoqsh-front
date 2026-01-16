import { useState } from "react";
import { useChecks, useStations, useReactivateCheck, useDeleteCheck } from "@/hooks/use-data";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, Search, Receipt, Droplets, CheckCircle, RotateCcw, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Check } from "@/types";

export default function ChecksPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const reactivateCheck = useReactivateCheck();
    const deleteCheck = useDeleteCheck();

    const [stationFilter, setStationFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const limit = 50;
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [selectedCheck, setSelectedCheck] = useState<Check | null>(null);
    const [quickAddAmount, setQuickAddAmount] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [lastCheck, setLastCheck] = useState<Check | null>(null);
    const [checkToDelete, setCheckToDelete] = useState<Check | null>(null);

    const { data: stations } = useStations();
    const { data: checks, isLoading } = useChecks({
        stationId: stationFilter !== "all" ? parseInt(stationFilter) : undefined,
        page,
        limit,
    });

    const pagination = checks?.pagination;

    const statusFilteredChecks = checks?.data?.filter(check => {
        if (statusFilter === "all") return true;
        if (statusFilter === "pending") return check.status === "pending" || check.status === "printed";
        return check.status === statusFilter;
    });

    const filteredChecks = statusFilteredChecks?.filter(check =>
        check.code.toLowerCase().includes(search.toLowerCase()) ||
        check.customerName?.toLowerCase().includes(search.toLowerCase()) ||
        check.customerPhone?.includes(search) ||
        check.operator?.fullName?.toLowerCase().includes(search.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'used': return <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Ishlatilgan</Badge>;
            case 'pending':
            case 'printed': return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">Kutilmoqda</Badge>;
            case 'expired': return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200">Muddati o'tgan</Badge>;
            case 'cancelled': return <Badge className="bg-red-100 text-red-700 hover:bg-red-200">Bekor qilingan</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const openQuickAdd = (check: Check) => {
        setSelectedCheck(check);
        setQuickAddAmount(check.amountLiters);
        setShowQuickAdd(true);
    };

    const handleQuickAdd = () => {
        if (!selectedCheck || !user) return;
        const amount = parseFloat(quickAddAmount);
        if (isNaN(amount) || amount <= 0) {
            toast({ title: "Xatolik", description: "Miqdorni to'g'ri kiriting", variant: "destructive" });
            return;
        }
        reactivateCheck.mutate({ checkId: selectedCheck.id, amountLiters: amount, operatorId: user.id }, {
            onSuccess: () => {
                setLastCheck({ ...selectedCheck, amountLiters: String(amount) });
                setShowQuickAdd(false);
                setShowSuccess(true);
                setQuickAddAmount("");
                setSelectedCheck(null);
            },
        });
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-display font-bold">Cheklar</h2>
                <p className="text-muted-foreground mt-1">Barcha cheklar ro'yxati.</p>
            </div>

            <div className="flex flex-wrap gap-4">
                <div className="relative w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Kod, mijoz yoki operator..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <Select value={stationFilter} onValueChange={(v) => { setStationFilter(v); setPage(1); }}>
                    <SelectTrigger className="w-48"><SelectValue placeholder="Shaxobcha" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Barcha shaxobchalar</SelectItem>
                        {stations?.map((s) => (<SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>))}
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                    <SelectTrigger className="w-40"><SelectValue placeholder="Holat" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Barchasi</SelectItem>
                        <SelectItem value="pending">Kutilmoqda</SelectItem>
                        <SelectItem value="used">Ishlatilgan</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2"><Receipt className="h-5 w-5" />Cheklar ro'yxati</span>
                        {pagination && <span className="text-sm font-normal text-muted-foreground">Jami: {pagination.total}</span>}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Kod</TableHead>
                                <TableHead>Miqdor</TableHead>
                                <TableHead>Shaxobcha</TableHead>
                                <TableHead>Operator</TableHead>
                                <TableHead>Mijoz</TableHead>
                                <TableHead>Holat</TableHead>
                                <TableHead>Yaratilgan</TableHead>
                                <TableHead>Ro'yxatdan o'tgan</TableHead>
                                <TableHead className="text-right">Amal</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={9} className="h-24 text-center"><div className="flex justify-center items-center gap-2"><Loader2 className="h-5 w-5 animate-spin text-primary" />Yuklanmoqda...</div></TableCell></TableRow>
                            ) : filteredChecks?.length === 0 ? (
                                <TableRow><TableCell colSpan={9} className="h-24 text-center text-muted-foreground">Cheklar topilmadi.</TableCell></TableRow>
                            ) : (
                                filteredChecks?.map((check) => (
                                    <TableRow key={check.id}>
                                        <TableCell className="font-mono font-bold">{check.code}</TableCell>
                                        <TableCell className="font-bold">{check.amountLiters} L</TableCell>
                                        <TableCell>{check.station?.name || '-'}</TableCell>
                                        <TableCell>{check.operator?.fullName || check.operator?.username || '-'}</TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{check.customer?.fullName || check.customerName || '-'}</p>
                                                {(check.customer?.phone || check.customerPhone) && (<p className="text-xs text-muted-foreground">{check.customer?.phone || check.customerPhone}</p>)}
                                            </div>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(check.status)}</TableCell>
                                        <TableCell className="text-muted-foreground">{format(new Date(check.createdAt), 'dd.MM.yyyy HH:mm')}</TableCell>
                                        <TableCell className="text-muted-foreground">{check.usedAt ? format(new Date(check.usedAt), 'dd.MM.yyyy HH:mm') : '-'}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {user?.stationId && (<Button size="sm" variant="outline" onClick={() => openQuickAdd(check)}><RotateCcw className="h-4 w-4 mr-1" />Qayta</Button>)}
                                                {user?.role === "moderator" && (<Button size="sm" variant="destructive" onClick={() => setCheckToDelete(check)}><Trash2 className="h-4 w-4" /></Button>)}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
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
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Oldingi
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
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

            <Dialog open={showQuickAdd} onOpenChange={setShowQuickAdd}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Qayta litr qo'shish</DialogTitle>
                        <DialogDescription>Chekni ishlatilgan qilib, mijoz hisobiga litr qo'shing</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <p className="font-medium">{selectedCheck?.customerName || selectedCheck?.customer?.fullName}</p>
                            <p className="text-sm text-muted-foreground">{selectedCheck?.customerPhone || selectedCheck?.customer?.phone}</p>
                            <p className="text-xs text-muted-foreground mt-1">Chek: {selectedCheck?.code}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Litr miqdori</label>
                            <div className="relative mt-1">
                                <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                                <Input type="number" placeholder="0.00" min="0.1" step="any" className="pl-10 h-12 text-xl font-bold" value={quickAddAmount} onChange={(e) => setQuickAddAmount(e.target.value)} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowQuickAdd(false)}>Bekor qilish</Button>
                        <Button onClick={handleQuickAdd} disabled={reactivateCheck.isPending}>{reactivateCheck.isPending ? "Qo'shilmoqda..." : "Qo'shish"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center flex items-center justify-center gap-2"><CheckCircle className="h-6 w-6 text-green-500" />Muvaffaqiyatli!</DialogTitle>
                        <DialogDescription className="text-center">Litrlar mijoz hisobiga qo'shildi.</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center py-6">
                        <div className="text-center space-y-2">
                            <p className="text-4xl font-bold text-primary">{lastCheck?.amountLiters} Litr</p>
                            <div className="text-sm text-muted-foreground mt-4 p-4 bg-slate-50 rounded-lg">
                                <p className="font-medium text-foreground">{lastCheck?.customerName}</p>
                                <p>{lastCheck?.customerPhone}</p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-center"><Button onClick={() => setShowSuccess(false)} className="w-full sm:w-auto">Tayyor</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!checkToDelete} onOpenChange={() => setCheckToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Chekni o'chirish</AlertDialogTitle>
                        <AlertDialogDescription>
                            <strong>{checkToDelete?.code}</strong> kodli chekni o'chirmoqchimisiz?
                            {checkToDelete?.status === "used" && (<span className="block mt-2 text-orange-600">⚠️ Bu chek ishlatilgan. O'chirilganda {checkToDelete?.amountLiters} litr mijoz balansidan ayiriladi.</span>)}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => { if (checkToDelete) { deleteCheck.mutate(checkToDelete.id, { onSuccess: () => setCheckToDelete(null) }); } }}>
                            {deleteCheck.isPending ? "O'chirilmoqda..." : "O'chirish"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
