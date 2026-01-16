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

interface UsersResponse {
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useUsers(
  role?: "moderator" | "operator" | "customer",
  page: number = 1,
  limit: number = 100
) {
  return useQuery<UsersResponse>({
    queryKey: ["/api/users", role, page, limit],
    queryFn: async () => {
      const { data } = await api.get("/api/users", {
        params: { role, page, limit },
      });
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
      queryClient.invalidateQueries({ queryKey: ["/api/users/report"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/top"] });
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

interface StationCustomersResponse {
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useStationCustomers(stationId: number, page: number = 1, limit: number = 50) {
  return useQuery<StationCustomersResponse>({
    queryKey: ["/api/users/station", stationId, "customers", page, limit],
    queryFn: async () => {
      const { data } = await api.get(`/api/users/station/${stationId}/customers`, {
        params: { page, limit },
      });
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

interface ChecksResponse {
  data: Check[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useChecks(filters?: {
  stationId?: number;
  status?: string;
  operatorId?: number;
  isPrinted?: boolean;
  page?: number;
  limit?: number;
}) {
  return useQuery<ChecksResponse>({
    queryKey: ["/api/checks", filters],
    queryFn: async () => {
      const { data } = await api.get("/api/checks", { params: { ...filters, limit: filters?.limit || 100 } });
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

interface CustomersReportResponse {
  data: TopCustomer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useCustomersReport(order: "asc" | "desc" = "desc", page: number = 1, limit: number = 50) {
  return useQuery<CustomersReportResponse>({
    queryKey: ["/api/users/report", order, page, limit],
    queryFn: async () => {
      const { data } = await api.get("/api/users/report", { params: { order, page, limit } });
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
