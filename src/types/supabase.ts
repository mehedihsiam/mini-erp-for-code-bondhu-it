export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          role: string
          created_at: string
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          role?: string
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          sku: string
          description: string | null
          price: number
          stock_quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          sku: string
          description?: string | null
          price: number
          stock_quantity?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          sku?: string
          description?: string | null
          price?: number
          stock_quantity?: number
          created_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
        }
      }
      suppliers: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
        }
      }
      purchases: {
        Row: {
          id: string
          supplier_id: string
          total_amount: number
          purchase_date: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          supplier_id: string
          total_amount?: number
          purchase_date?: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          supplier_id?: string
          total_amount?: number
          purchase_date?: string
          status?: string
          created_at?: string
        }
      }
      purchase_items: {
        Row: {
          id: string
          purchase_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
        }
        Insert: {
          id?: string
          purchase_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
        }
        Update: {
          id?: string
          purchase_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
        }
      }
      sales: {
        Row: {
          id: string
          customer_id: string
          total_amount: number
          sale_date: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          total_amount?: number
          sale_date?: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          total_amount?: number
          sale_date?: string
          status?: string
          created_at?: string
        }
      }
      sale_items: {
        Row: {
          id: string
          sale_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
        }
        Insert: {
          id?: string
          sale_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
        }
        Update: {
          id?: string
          sale_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
        }
      }
    }
  }
}
