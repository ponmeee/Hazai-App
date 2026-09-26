/**
 * supabase/migrations に対応する DB の型定義（`supabase gen types typescript` と同じ形式）。
 * マイグレーションを変更したら次のコマンドで再生成し、差分を確認すること:
 *   npx supabase gen types typescript --project-id <project-ref> --schema public > src/lib/supabase/database.types.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      cart_items: {
        Row: {
          created_at: string;
          id: string;
          listing_id: string;
          quantity: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          listing_id: string;
          quantity?: number;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          listing_id?: string;
          quantity?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'cart_items_listing_id_fkey';
            columns: ['listing_id'];
            isOneToOne: false;
            referencedRelation: 'listings';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'cart_items_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      conversation_members: {
        Row: {
          conversation_id: string;
          created_at: string;
          user_id: string;
        };
        Insert: {
          conversation_id: string;
          created_at?: string;
          user_id: string;
        };
        Update: {
          conversation_id?: string;
          created_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'conversation_members_conversation_id_fkey';
            columns: ['conversation_id'];
            isOneToOne: false;
            referencedRelation: 'conversations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'conversation_members_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      conversations: {
        Row: {
          created_at: string;
          id: string;
          listing_id: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          listing_id?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          listing_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'conversations_listing_id_fkey';
            columns: ['listing_id'];
            isOneToOne: false;
            referencedRelation: 'listings';
            referencedColumns: ['id'];
          },
        ];
      };
      favorites: {
        Row: {
          created_at: string;
          listing_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          listing_id: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          listing_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'favorites_listing_id_fkey';
            columns: ['listing_id'];
            isOneToOne: false;
            referencedRelation: 'listings';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'favorites_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      follows: {
        Row: {
          created_at: string;
          followee_id: string;
          follower_id: string;
        };
        Insert: {
          created_at?: string;
          followee_id: string;
          follower_id?: string;
        };
        Update: {
          created_at?: string;
          followee_id?: string;
          follower_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'follows_followee_id_fkey';
            columns: ['followee_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'follows_follower_id_fkey';
            columns: ['follower_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      gallery_images: {
        Row: {
          created_at: string;
          gallery_post_id: string;
          id: string;
          sort_order: number;
          storage_path: string;
        };
        Insert: {
          created_at?: string;
          gallery_post_id: string;
          id?: string;
          sort_order?: number;
          storage_path: string;
        };
        Update: {
          created_at?: string;
          gallery_post_id?: string;
          id?: string;
          sort_order?: number;
          storage_path?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'gallery_images_gallery_post_id_fkey';
            columns: ['gallery_post_id'];
            isOneToOne: false;
            referencedRelation: 'gallery_posts';
            referencedColumns: ['id'];
          },
        ];
      };
      gallery_comments: {
        Row: {
          author_id: string;
          content: string;
          created_at: string;
          gallery_post_id: string;
          id: string;
        };
        Insert: {
          author_id?: string;
          content: string;
          created_at?: string;
          gallery_post_id: string;
          id?: string;
        };
        Update: {
          author_id?: string;
          content?: string;
          created_at?: string;
          gallery_post_id?: string;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'gallery_comments_author_id_fkey';
            columns: ['author_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'gallery_comments_gallery_post_id_fkey';
            columns: ['gallery_post_id'];
            isOneToOne: false;
            referencedRelation: 'gallery_posts';
            referencedColumns: ['id'];
          },
        ];
      };
      gallery_likes: {
        Row: {
          created_at: string;
          gallery_post_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          gallery_post_id: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          gallery_post_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'gallery_likes_gallery_post_id_fkey';
            columns: ['gallery_post_id'];
            isOneToOne: false;
            referencedRelation: 'gallery_posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'gallery_likes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      gallery_post_materials: {
        Row: {
          created_at: string;
          gallery_post_id: string;
          id: string;
          image_bucket: string | null;
          image_path: string | null;
          listing_id: string | null;
          name: string;
          sort_order: number;
          tags: string[];
        };
        Insert: {
          created_at?: string;
          gallery_post_id: string;
          id?: string;
          image_bucket?: string | null;
          image_path?: string | null;
          listing_id?: string | null;
          name: string;
          sort_order?: number;
          tags?: string[];
        };
        Update: {
          created_at?: string;
          gallery_post_id?: string;
          id?: string;
          image_bucket?: string | null;
          image_path?: string | null;
          listing_id?: string | null;
          name?: string;
          sort_order?: number;
          tags?: string[];
        };
        Relationships: [
          {
            foreignKeyName: 'gallery_post_materials_gallery_post_id_fkey';
            columns: ['gallery_post_id'];
            isOneToOne: false;
            referencedRelation: 'gallery_posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'gallery_post_materials_listing_id_fkey';
            columns: ['listing_id'];
            isOneToOne: false;
            referencedRelation: 'listings';
            referencedColumns: ['id'];
          },
        ];
      };
      gallery_posts: {
        Row: {
          author_id: string;
          category: string;
          comment_count: number;
          created_at: string;
          description: string;
          id: string;
          like_count: number;
          title: string;
          updated_at: string;
        };
        Insert: {
          author_id?: string;
          category: string;
          comment_count?: number;
          created_at?: string;
          description?: string;
          id?: string;
          like_count?: number;
          title: string;
          updated_at?: string;
        };
        Update: {
          author_id?: string;
          category?: string;
          comment_count?: number;
          created_at?: string;
          description?: string;
          id?: string;
          like_count?: number;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'gallery_posts_author_id_fkey';
            columns: ['author_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      listing_images: {
        Row: {
          created_at: string;
          id: string;
          listing_id: string;
          sort_order: number;
          storage_path: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          listing_id: string;
          sort_order?: number;
          storage_path: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          listing_id?: string;
          sort_order?: number;
          storage_path?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'listing_images_listing_id_fkey';
            columns: ['listing_id'];
            isOneToOne: false;
            referencedRelation: 'listings';
            referencedColumns: ['id'];
          },
        ];
      };
      listings: {
        Row: {
          category: string;
          condition: string | null;
          created_at: string;
          description: string;
          favorite_count: number;
          id: string;
          price: number;
          seller_id: string;
          shipping_methods: string[];
          size: string | null;
          status: string;
          tags: string[];
          title: string;
          updated_at: string;
          weight: string | null;
        };
        Insert: {
          category: string;
          condition?: string | null;
          created_at?: string;
          description: string;
          favorite_count?: number;
          id?: string;
          price: number;
          seller_id?: string;
          shipping_methods: string[];
          size?: string | null;
          status?: string;
          tags?: string[];
          title: string;
          updated_at?: string;
          weight?: string | null;
        };
        Update: {
          category?: string;
          condition?: string | null;
          created_at?: string;
          description?: string;
          favorite_count?: number;
          id?: string;
          price?: number;
          seller_id?: string;
          shipping_methods?: string[];
          size?: string | null;
          status?: string;
          tags?: string[];
          title?: string;
          updated_at?: string;
          weight?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'listings_seller_id_fkey';
            columns: ['seller_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      messages: {
        Row: {
          content: string;
          conversation_id: string;
          created_at: string;
          id: string;
          sender_id: string;
        };
        Insert: {
          content: string;
          conversation_id: string;
          created_at?: string;
          id?: string;
          sender_id?: string;
        };
        Update: {
          content?: string;
          conversation_id?: string;
          created_at?: string;
          id?: string;
          sender_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'messages_conversation_id_fkey';
            columns: ['conversation_id'];
            isOneToOne: false;
            referencedRelation: 'conversations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'messages_sender_id_fkey';
            columns: ['sender_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      order_items: {
        Row: {
          created_at: string;
          id: string;
          image_path: string | null;
          listing_id: string | null;
          order_id: string;
          price: number;
          seller_id: string | null;
          title: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          image_path?: string | null;
          listing_id?: string | null;
          order_id: string;
          price: number;
          seller_id?: string | null;
          title: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          image_path?: string | null;
          listing_id?: string | null;
          order_id?: string;
          price?: number;
          seller_id?: string | null;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'order_items_listing_id_fkey';
            columns: ['listing_id'];
            isOneToOne: true;
            referencedRelation: 'listings';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_items_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_items_seller_id_fkey';
            columns: ['seller_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      orders: {
        Row: {
          buyer_id: string;
          created_at: string;
          id: string;
          total_price: number;
        };
        Insert: {
          buyer_id: string;
          created_at?: string;
          id?: string;
          total_price: number;
        };
        Update: {
          buyer_id?: string;
          created_at?: string;
          id?: string;
          total_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'orders_buyer_id_fkey';
            columns: ['buyer_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string;
          created_at: string;
          display_name: string;
          genre: string;
          id: string;
          location: string;
          updated_at: string;
          username: string;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string;
          created_at?: string;
          display_name: string;
          genre?: string;
          id: string;
          location?: string;
          updated_at?: string;
          username: string;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string;
          created_at?: string;
          display_name?: string;
          genre?: string;
          id?: string;
          location?: string;
          updated_at?: string;
          username?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      profile_stats: {
        Row: {
          follower_count: number | null;
          following_count: number | null;
          id: string | null;
          like_count: number | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      create_gallery_post: {
        Args: {
          p_category: string;
          p_description: string;
          p_image_paths: string[];
          p_materials?: Json;
          p_title: string;
        };
        Returns: string;
      };
      create_listing: {
        Args: {
          p_category: string;
          p_condition: string | null;
          p_description: string;
          p_image_paths: string[];
          p_price: number;
          p_shipping_methods: string[];
          p_size: string | null;
          p_tags?: string[];
          p_title: string;
          p_weight: string | null;
        };
        Returns: string;
      };
      get_my_conversations: {
        Args: { p_conversation_id?: string | null };
        Returns: {
          id: string;
          last_message_content: string | null;
          last_message_created_at: string | null;
          last_message_id: string | null;
          last_message_sender_id: string | null;
          listing_id: string | null;
          listing_image_path: string | null;
          listing_price: number | null;
          listing_title: string | null;
          other_avatar_url: string | null;
          other_display_name: string;
          other_genre: string;
          other_location: string;
          other_user_id: string;
          updated_at: string;
        }[];
      };
      get_related_gallery_posts: {
        Args: { p_limit?: number; p_listing_id: string };
        Returns: {
          gallery_post_id: string;
          score: number;
        }[];
      };
      is_conversation_member: {
        Args: { p_conversation_id: string };
        Returns: boolean;
      };
      is_valid_tags: {
        Args: { p_tags: string[] };
        Returns: boolean;
      };
      purchase_listings: {
        Args: { p_listing_ids: string[] };
        Returns: string;
      };
      start_conversation: {
        Args: { p_listing_id?: string | null; p_other_user_id: string };
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database['public'];

export type Tables<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Row'];
export type TablesInsert<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Update'];
