import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  type InsertUser,
  type User,
  type Station,
  type Check,
  type Message,
  type StatsResponse,
  type OperatorStats,
  type CreateCheck,
  type CreateStation,
  type CreateMessage,
} from "@/types";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

export function useUsers(role?: "moderator" | "operator" | "customer") {
  return useQuery<User[]>({
    queryKey: ["/api/users", role],
    queryFn: async () => {
      const { data } = await api.get("/api/users", { params: role ? { role } : {} });
      return data;
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (userData: InsertUser) => {
      const { data } = await api.post<User>("/api/users", userData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Muvaffaqiyat", description: "Foydalanuvchi yaratildi" });
    },
    onError: (error: any) => {
      toast({ title: "Xatolik", description: error.response?.data?.message || "Foydalanuvchi yaratishda xatolik", variant: "destructive" });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data: userData }: { id: number; data: Partial<InsertUser> }) => {
      const { data } = await api.put<User>(`/api/users/${id}`, userData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Muvaffaqiyat", description: "Foydalanuvchi yangilandi" });
    },
    onError: (error: any) => {
      toast({ title: "Xatolik", description: error.response?.data?.message || "Foydalanuvchi yangilashda xatolik", variant: "destructive" });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/users/${id}`);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Muvaffaqiyat", description: "Foydalanuvchi o'chirildi" });
    },
    onError: (error: any) => {
      toast({ title: "Xatolik", description: error.response?.data?.message || "Foydalanuvchi o'chirishda xatolik", variant: "destructive" });
    },
  });
}

export function useStationCustomers(stationId: number) {
  return useQuery<User[]>({
    queryKey: ["/api/users/station", stationId, "customers"],
    queryFn: async () => {
      const { data } = await api.get(`/api/users/station/${stationId}/customers`);
      return data;
    },
    enabled: !!stationId,
  });
}

export function useStations() {
  return useQuery<Station[]>({
    queryKey: ["/api/stations"],
    queryFn: async () => {
      const { data } = await api.get("/api/stations");
      return data;
    },
  });
}

export function useCreateStation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (stationData: CreateStation) => {
      const { data } = await api.post<Station>("/api/stations", stationData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stations"] });
      toast({ title: "Muvaffaqiyat", description: "Shaxobcha yaratildi" });
    },
    onError: (error: any) => {
      toast({ title: "Xatolik", description: error.response?.data?.message || "Shaxobcha yaratishda xatolik", variant: "destructive" });
    },
  });
}

export function useUpdateStation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data: stationData }: { id: number; data: Partial<CreateStation & { isActive?: boolean }> }) => {
      const { data } = await api.put<Station>(`/api/stations/${id}`, stationData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stations"] });
      toast({ title: "Muvaffaqiyat", description: "Shaxobcha yangilandi" });
    },
    onError: (error: any) => {
      toast({ title: "Xatolik", description: error.response?.data?.message || "Shaxobcha yangilashda xatolik", variant: "destructive" });
    },
  });
}

export function useDeleteStation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/stations/${id}`);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stations"] });
      toast({ title: "Muvaffaqiyat", description: "Shaxobcha o'chirildi" });
    },
    onError: (error: any) => {
      toast({ title: "Xatolik", description: error.response?.data?.message || "Shaxobcha o'chirishda xatolik", variant: "destructive" });
    },
  });
}

export function useChecks(filters?: { stationId?: number; status?: string; operatorId?: number }) {
  return useQuery<Check[]>({
    queryKey: ["/api/checks", filters],
    queryFn: async () => {
      const { data } = await api.get("/api/checks", { params: filters });
      return data;
    },
  });
}

export function useCreateCheck() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (checkData: CreateCheck) => {
      const { data } = await api.post<Check>("/api/checks", checkData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Muvaffaqiyat", description: "Chek yaratildi" });
    },
    onError: (error: any) => {
      toast({ title: "Xatolik", description: error.response?.data?.message || "Chek yaratishda xatolik", variant: "destructive" });
    },
  });
}

export function useConfirmCheck() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (checkId: number) => {
      const { data } = await api.put(`/api/checks/${checkId}/confirm`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Muvaffaqiyat", description: "Chek tasdiqlandi" });
    },
    onError: (error: any) => {
      toast({ title: "Xatolik", description: error.response?.data?.message || "Chekni tasdiqlashda xatolik", variant: "destructive" });
    },
  });
}

export function useCancelCheck() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (checkId: number) => {
      const { data } = await api.put(`/api/checks/${checkId}/cancel`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checks"] });
      toast({ title: "Muvaffaqiyat", description: "Chek bekor qilindi" });
    },
    onError: (error: any) => {
      toast({ title: "Xatolik", description: error.response?.data?.message || "Chekni bekor qilishda xatolik", variant: "destructive" });
    },
  });
}

export function useDeleteCheck() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (checkId: number) => {
      const { data } = await api.delete(`/api/checks/${checkId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Muvaffaqiyat", description: "Chek o'chirildi" });
    },
    onError: (error: any) => {
      toast({ title: "Xatolik", description: error.response?.data?.message || "Chekni o'chirishda xatolik", variant: "destructive" });
    },
  });
}

export function useReactivateCheck() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ checkId, amountLiters, operatorId }: { checkId: number; amountLiters: number; operatorId: number }) => {
      const { data } = await api.put<Check>(`/api/checks/${checkId}/reactivate`, { amountLiters, operatorId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Muvaffaqiyat", description: "Litrlar mijoz hisobiga qo'shildi" });
    },
    onError: (error: any) => {
      toast({ title: "Xatolik", description: error.response?.data?.message || "Litr qo'shishda xatolik", variant: "destructive" });
    },
  });
}

export function useOperatorStats(operatorId: number) {
  return useQuery<OperatorStats>({
    queryKey: ["/api/stats/operator", operatorId],
    queryFn: async () => {
      const { data } = await api.get(`/api/stats/operator/${operatorId}`);
      return data;
    },
    enabled: !!operatorId,
  });
}

export function useMessages() {
  return useQuery<Message[]>({
    queryKey: ["/api/messages"],
    queryFn: async () => {
      const { data } = await api.get("/api/messages");
      return data;
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (messageData: CreateMessage) => {
      const { data } = await api.post("/api/messages/send-all", messageData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      toast({ title: "Muvaffaqiyat", description: `Xabar ${data.recipientsCount} ta mijozga yuborildi` });
    },
    onError: (error: any) => {
      toast({ title: "Xatolik", description: error.response?.data?.message || "Xabar yuborishda xatolik", variant: "destructive" });
    },
  });
}

export function useStats() {
  return useQuery<StatsResponse>({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      const { data } = await api.get("/api/stats");
      return data;
    },
  });
}

interface TopCustomer {
  id: number;
  fullName: string | null;
  phone: string | null;
  balanceLiters: string;
  _count?: { usedChecks: number };
}

export function useTopCustomers(order: "asc" | "desc" = "desc", limit: number = 10) {
  return useQuery<TopCustomer[]>({
    queryKey: ["/api/users/top", order, limit],
    queryFn: async () => {
      const { data } = await api.get("/api/users/top", { params: { order, limit } });
      return data;
    },
  });
}

export function useCustomersReport(order: "asc" | "desc" = "desc") {
  return useQuery<TopCustomer[]>({
    queryKey: ["/api/users/report", order],
    queryFn: async () => {
      const { data } = await api.get("/api/users/report", { params: { order } });
      return data;
    },
  });
}

export async function exportCustomersToExcel() {
  const response = await api.get("/api/users/export/excel", { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const a = document.createElement("a");
  a.href = url;
  a.download = `mijozlar-hisoboti-${new Date().toISOString().split("T")[0]}.xlsx`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  a.remove();
}
