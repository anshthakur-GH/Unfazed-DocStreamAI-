import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, Document, DocumentCreateData, DocumentUpdateData } from '@/services/api';

// Query keys
export const documentKeys = {
  all: ['documents'] as const,
  lists: () => [...documentKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...documentKeys.lists(), filters] as const,
  listByDept: (department: string, filters: Record<string, any>) => [...documentKeys.lists(), 'department', department, filters] as const,
  details: () => [...documentKeys.all, 'detail'] as const,
  detail: (id: string) => [...documentKeys.details(), id] as const,
  recent: () => [...documentKeys.all, 'recent'] as const,
  stats: () => [...documentKeys.all, 'stats'] as const,
  health: () => ['health'] as const,
  connections: () => ['connections'] as const,
};

// Get all documents with filters
export const useDocuments = (params: {
  limit?: number;
  skip?: number;
  sort?: 'asc' | 'desc';
  document_type?: string;
  search?: string;
  urgency_sort?: string; // Add urgency_sort parameter
} = {}) => {
  return useQuery({
    queryKey: documentKeys.list(params),
    queryFn: () => apiService.getDocuments(params),
    staleTime: 30000, // 30 seconds
  });
};

// Get documents by department with filters
export const useDocumentsByDepartment = (
  department: string,
  params: {
    limit?: number;
    skip?: number;
    sort?: 'asc' | 'desc';
    document_type?: string;
    search?: string;
    urgency_sort?: string; // Add urgency_sort parameter
  } = {}
) => {
  return useQuery({
    queryKey: documentKeys.listByDept(department, params),
    queryFn: () => apiService.getDocumentsByDepartment(department, params),
    enabled: !!department,
    staleTime: 30000,
  });
};

// Unified documents list hook (with optional department)
export const useDocumentsList = (
  options: (
    {
      department?: string;
      limit?: number;
      skip?: number;
      sort?: 'asc' | 'desc';
      search?: string;
      urgency_sort?: string; // Add urgency_sort parameter
    }
  ) = {}
) => {
  const { department, ...params } = options;
  const queryKey = department
    ? documentKeys.listByDept(department, params)
    : documentKeys.list(params);

  return useQuery({
    queryKey,
    queryFn: () =>
      department
        ? apiService.getDocumentsByDepartment(department, params)
        : apiService.getDocuments(params),
    staleTime: 30000,
  });
};

// Get single document
export const useDocument = (id: string) => {
  return useQuery({
    queryKey: documentKeys.detail(id),
    queryFn: () => apiService.getDocument(id),
    enabled: !!id,
  });
};

// Get related documents
export const useRelatedDocuments = (id: string, limit: number = 5) => {
  return useQuery({
    queryKey: [...documentKeys.detail(id), 'related', limit],
    queryFn: () => apiService.getRelatedDocuments(id, limit),
    enabled: !!id,
    staleTime: 300000, // 5 minutes (related docs change less frequently)
  });
};

// Get recent documents
export const useRecentDocuments = (limit: number = 10) => {
  return useQuery({
    queryKey: documentKeys.recent(),
    queryFn: () => apiService.getRecentDocuments(limit),
    staleTime: 60000, // 1 minute
  });
};

// Get data statistics
export const useDataStats = () => {
  return useQuery({
    queryKey: documentKeys.stats(),
    queryFn: () => apiService.getDataStats(),
    staleTime: 300000, // 5 minutes
  });
};

// Get health status
export const useHealth = () => {
  return useQuery({
    queryKey: documentKeys.health(),
    queryFn: () => apiService.getHealth(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

// Get connection stats
export const useConnectionStats = () => {
  return useQuery({
    queryKey: documentKeys.connections(),
    queryFn: () => apiService.getConnectionStats(),
    refetchInterval: 10000, // Refetch every 10 seconds
  });
};

// Create document mutation
export const useCreateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DocumentCreateData) => apiService.createDocument(data),
    onSuccess: () => {
      // Invalidate and refetch documents list
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: documentKeys.recent() });
      queryClient.invalidateQueries({ queryKey: documentKeys.stats() });
    },
  });
};

// Update document mutation
export const useUpdateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DocumentUpdateData }) =>
      apiService.updateDocument(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate specific document and lists
      queryClient.invalidateQueries({ queryKey: documentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: documentKeys.recent() });
      queryClient.invalidateQueries({ queryKey: documentKeys.stats() });
    },
  });
};

// Delete document mutation
export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiService.deleteDocument(id),
    onSuccess: () => {
      // Invalidate all document queries
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
    },
  });
};
