const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:4000/api' : '/api');

export interface Document {
  _id: string;
  document_title: string;
  document_type: "Research Paper" | "Lecture Notes" | "Policy Document" | "Other";
  uploaded_by: string;
  upload_timestamp: string;
  user_id: string;
  user_profile: "Head" | "Teacher" | "Student";
  research_domain: string | null;
  subject_tags: string[];
  course_code: string | null;
  academic_year: string | null;
  authors: string[];
  date_published: string | null;
  date_received: string;
  funding_source: string | null;
  summary: string;
  keywords: string[];
  urgency_level: "High" | "Medium" | "Low";
  google_drive_link: string | null;
  webViewLink: string | null;
  content?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentCreateData {
  document_title: string;
  document_type: "Research Paper" | "Lecture Notes" | "Policy Document" | "Other";
  uploaded_by: string;
  user_id: string;
  user_profile: "Head" | "Teacher" | "Student";
  research_domain?: string | null;
  subject_tags?: string[];
  course_code?: string | null;
  academic_year?: string | null;
  authors?: string[];
  date_published?: string | null;
  date_received?: string;
  funding_source?: string | null;
  summary: string;
  keywords?: string[];
  urgency_level: "High" | "Medium" | "Low";
  google_drive_link?: string | null;
  webViewLink?: string | null;
}

export interface DocumentUpdateData extends Partial<DocumentCreateData> {}

export interface ApiResponse<T> {
  data: T;
  pagination?: {
    total: number;
    limit: number;
    skip: number;
    hasMore: boolean;
  };
  filters?: {
    document_type?: string;
    search?: string;
    department?: string;
  };
}

export interface StatsResponse {
  total: number;
  documentTypes: Array<{ _id: string; count: number }>;
  userProfiles: Array<{ _id: string; count: number }>;
}

export interface HealthResponse {
  status: string;
  database: string;
  timestamp: string;
  uptime: number;
}

export interface ConnectionStatsResponse {
  connectedClients: number;
  timestamp: string;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`Making API request to: ${url}`);
      const response = await fetch(url, config);
      
      console.log(`Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Response:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server. Please check if the server is running on port 4000.');
      }
      throw error;
    }
  }

  // Health check
  async getHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health');
  }

  // Get all documents with filtering and pagination
  async getDocuments(params: {
    limit?: number;
    skip?: number;
    sort?: 'asc' | 'desc';
    document_type?: string;
    user_profile?: string;
    urgency_level?: string;
    search?: string;
    urgency_sort?: string;
  } = {}): Promise<ApiResponse<Document[]>> {
    const searchParams = new URLSearchParams();
    
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.skip) searchParams.append('skip', params.skip.toString());
    if (params.sort) searchParams.append('sort', params.sort);
    if (params.document_type) searchParams.append('document_type', params.document_type);
    if (params.user_profile) searchParams.append('user_profile', params.user_profile);
    if (params.urgency_level) searchParams.append('urgency_level', params.urgency_level);
    if (params.search) searchParams.append('search', params.search);
    if (params.urgency_sort) searchParams.append('urgency_sort', params.urgency_sort); // Append urgency_sort

    const queryString = searchParams.toString();
    const endpoint = `/data${queryString ? `?${queryString}` : ''}`;
    
    return this.request<ApiResponse<Document[]>>(endpoint);
  }

  // Get single document by ID
  async getDocument(id: string): Promise<Document> {
    return this.request<Document>(`/data/${id}`);
  }

  // Get related documents by ID
  async getRelatedDocuments(id: string, limit: number = 5): Promise<{
    data: Document[];
    count: number;
    currentDocumentId: string;
    limit: number;
  }> {
    return this.request<{
      data: Document[];
      count: number;
      currentDocumentId: string;
      limit: number;
    }>(`/data/${id}/related?limit=${limit}`);
  }

  // Get documents by profile with filtering and pagination
  async getDocumentsByProfile(
    profile: string,
    params: {
      limit?: number;
      skip?: number;
      sort?: 'asc' | 'desc';
      document_type?: string;
      search?: string;
      urgency_sort?: string;
    } = {}
  ): Promise<ApiResponse<Document[]>> {
    return this.getDocuments({ ...params, user_profile: profile });
  }

  // Create new document
  async createDocument(data: DocumentCreateData): Promise<{ success: boolean; data: Document }> {
    return this.request<{ success: boolean; data: Document }>('/createData', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update document by ID
  async updateDocument(id: string, data: DocumentUpdateData): Promise<{ success: boolean; data: Document }> {
    return this.request<{ success: boolean; data: Document }>(`/data/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Delete document
  async deleteDocument(id: string): Promise<{ success: boolean; message: string; deletedId: string }> {
    return this.request<{ success: boolean; message: string; deletedId: string }>(`/data/${id}`, {
      method: 'DELETE',
    });
  }

  // Get recent documents
  async getRecentDocuments(limit: number = 10): Promise<{ data: Document[]; count: number; limit: number }> {
    return this.request<{ data: Document[]; count: number; limit: number }>(`/data/recent?limit=${limit}`);
  }

  // Get data statistics
  async getDataStats(): Promise<StatsResponse> {
    const response = await this.request<any>('/stats/data');
    return {
      total: response.total,
      documentTypes: response.documentTypes,
      userProfiles: response.userProfiles || response.departments || [], // Map departments to userProfiles for compatibility
    };
  }

  // Get WebSocket connection stats
  async getConnectionStats(): Promise<ConnectionStatsResponse> {
    return this.request<ConnectionStatsResponse>('/stats/connections');
  }
}

export const apiService = new ApiService();
export default apiService;
