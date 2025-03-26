[
  {
    "table_name": "conversation_participants",
    "column_name": "user_id",
    "data_type": "uuid"
  },
  {
    "table_name": "conversation_participants",
    "column_name": "last_read_at",
    "data_type": "timestamp with time zone"
  },
  {
    "table_name": "conversation_participants",
    "column_name": "conversation_id",
    "data_type": "uuid"
  },
  {
    "table_name": "conversations",
    "column_name": "created_at",
    "data_type": "timestamp with time zone"
  },
  {
    "table_name": "conversations",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone"
  },
  {
    "table_name": "conversations",
    "column_name": "id",
    "data_type": "uuid"
  },
  {
    "table_name": "message_reactions",
    "column_name": "user_id",
    "data_type": "uuid"
  },
  {
    "table_name": "message_reactions",
    "column_name": "created_at",
    "data_type": "timestamp with time zone"
  },
  {
    "table_name": "message_reactions",
    "column_name": "message_id",
    "data_type": "uuid"
  },
  {
    "table_name": "message_reactions",
    "column_name": "reaction",
    "data_type": "text"
  },
  {
    "table_name": "messages",
    "column_name": "is_read",
    "data_type": "boolean"
  },
  {
    "table_name": "messages",
    "column_name": "id",
    "data_type": "uuid"
  },
  {
    "table_name": "messages",
    "column_name": "conversation_id",
    "data_type": "uuid"
  },
  {
    "table_name": "messages",
    "column_name": "sender_id",
    "data_type": "uuid"
  },
  {
    "table_name": "messages",
    "column_name": "created_at",
    "data_type": "timestamp with time zone"
  },
  {
    "table_name": "messages",
    "column_name": "content",
    "data_type": "text"
  },
  {
    "table_name": "onboarding_status",
    "column_name": "is_complete",
    "data_type": "boolean"
  },
  {
    "table_name": "onboarding_status",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone"
  },
  {
    "table_name": "onboarding_status",
    "column_name": "current_step",
    "data_type": "text"
  },
  {
    "table_name": "onboarding_status",
    "column_name": "user_id",
    "data_type": "uuid"
  },
  {
    "table_name": "profiles",
    "column_name": "avatar_url",
    "data_type": "text"
  },
  {
    "table_name": "profiles",
    "column_name": "is_online",
    "data_type": "boolean"
  },
  {
    "table_name": "profiles",
    "column_name": "likes_count",
    "data_type": "integer"
  },
  {
    "table_name": "profiles",
    "column_name": "created_at",
    "data_type": "timestamp with time zone"
  },
  {
    "table_name": "profiles",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone"
  },
  {
    "table_name": "profiles",
    "column_name": "username",
    "data_type": "text"
  },
  {
    "table_name": "profiles",
    "column_name": "bio",
    "data_type": "text"
  },
  {
    "table_name": "profiles",
    "column_name": "id",
    "data_type": "uuid"
  },
  {
    "table_name": "user_likes",
    "column_name": "liker_id",
    "data_type": "uuid"
  },
  {
    "table_name": "user_likes",
    "column_name": "liked_id",
    "data_type": "uuid"
  },
  {
    "table_name": "user_likes",
    "column_name": "created_at",
    "data_type": "timestamp with time zone"
  },
  {
    "table_name": "users",
    "column_name": "last_login",
    "data_type": "timestamp with time zone"
  },
  {
    "table_name": "users",
    "column_name": "streak_last_date",
    "data_type": "date"
  },
  {
    "table_name": "users",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone"
  },
  {
    "table_name": "users",
    "column_name": "created_at",
    "data_type": "timestamp with time zone"
  },
  {
    "table_name": "users",
    "column_name": "id",
    "data_type": "uuid"
  },
  {
    "table_name": "users",
    "column_name": "date_of_birth",
    "data_type": "date"
  },
  {
    "table_name": "users",
    "column_name": "native_language",
    "data_type": "text"
  },
  {
    "table_name": "users",
    "column_name": "learning_language",
    "data_type": "text"
  },
  {
    "table_name": "users",
    "column_name": "proficiency_level",
    "data_type": "text"
  },
  {
    "table_name": "users",
    "column_name": "learning_goal",
    "data_type": "text"
  },
  {
    "table_name": "users",
    "column_name": "email",
    "data_type": "text"
  },
  {
    "table_name": "users",
    "column_name": "full_name",
    "data_type": "text"
  },
  {
    "table_name": "users",
    "column_name": "gender",
    "data_type": "text"
  },
  {
    "table_name": "users",
    "column_name": "avatar_url",
    "data_type": "text"
  },
  {
    "table_name": "users",
    "column_name": "streak_count",
    "data_type": "integer"
  }
]

[
  {
    "id": "avatars",
    "name": "avatars",
    "owner": null,
    "created_at": "2025-03-24 03:04:43.050527+00",
    "updated_at": "2025-03-24 03:04:43.050527+00",
    "public": true,
    "avif_autodetection": false,
    "file_size_limit": null,
    "allowed_mime_types": null,
    "owner_id": null
  },
  {
    "id": "attachments",
    "name": "attachments",
    "owner": null,
    "created_at": "2025-03-24 03:04:43.050527+00",
    "updated_at": "2025-03-24 03:04:43.050527+00",
    "public": true,
    "avif_autodetection": false,
    "file_size_limit": null,
    "allowed_mime_types": null,
    "owner_id": null
  }
]

[
  {
    "table_name": "objects",
    "column_name": "bucket_id",
    "foreign_table": "buckets",
    "foreign_column": "id"
  },
  {
    "table_name": "users",
    "column_name": "id",
    "foreign_table": "users",
    "foreign_column": "id"
  },
  {
    "table_name": "profiles",
    "column_name": "id",
    "foreign_table": "users",
    "foreign_column": "id"
  },
  {
    "table_name": "onboarding_status",
    "column_name": "user_id",
    "foreign_table": "users",
    "foreign_column": "id"
  },
  {
    "table_name": "conversation_participants",
    "column_name": "conversation_id",
    "foreign_table": "conversations",
    "foreign_column": "id"
  },
  {
    "table_name": "conversation_participants",
    "column_name": "user_id",
    "foreign_table": "users",
    "foreign_column": "id"
  },
  {
    "table_name": "messages",
    "column_name": "conversation_id",
    "foreign_table": "conversations",
    "foreign_column": "id"
  },
  {
    "table_name": "messages",
    "column_name": "sender_id",
    "foreign_table": "users",
    "foreign_column": "id"
  },
  {
    "table_name": "message_reactions",
    "column_name": "message_id",
    "foreign_table": "messages",
    "foreign_column": "id"
  },
  {
    "table_name": "message_reactions",
    "column_name": "user_id",
    "foreign_table": "users",
    "foreign_column": "id"
  },
  {
    "table_name": "user_likes",
    "column_name": "liker_id",
    "foreign_table": "users",
    "foreign_column": "id"
  },
  {
    "table_name": "user_likes",
    "column_name": "liked_id",
    "foreign_table": "users",
    "foreign_column": "id"
  },
  {
    "table_name": "messages",
    "column_name": "sender_id",
    "foreign_table": "profiles",
    "foreign_column": "id"
  },
  {
    "table_name": "identities",
    "column_name": "user_id",
    "foreign_table": "users",
    "foreign_column": "id"
  },
  {
    "table_name": "sessions",
    "column_name": "user_id",
    "foreign_table": "users",
    "foreign_column": "id"
  },
  {
    "table_name": "refresh_tokens",
    "column_name": "session_id",
    "foreign_table": "sessions",
    "foreign_column": "id"
  },
  {
    "table_name": "mfa_factors",
    "column_name": "user_id",
    "foreign_table": "users",
    "foreign_column": "id"
  },
  {
    "table_name": "mfa_challenges",
    "column_name": "factor_id",
    "foreign_table": "mfa_factors",
    "foreign_column": "id"
  },
  {
    "table_name": "mfa_amr_claims",
    "column_name": "session_id",
    "foreign_table": "sessions",
    "foreign_column": "id"
  },
  {
    "table_name": "sso_domains",
    "column_name": "sso_provider_id",
    "foreign_table": "sso_providers",
    "foreign_column": "id"
  },
  {
    "table_name": "saml_providers",
    "column_name": "sso_provider_id",
    "foreign_table": "sso_providers",
    "foreign_column": "id"
  },
  {
    "table_name": "saml_relay_states",
    "column_name": "sso_provider_id",
    "foreign_table": "sso_providers",
    "foreign_column": "id"
  },
  {
    "table_name": "saml_relay_states",
    "column_name": "flow_state_id",
    "foreign_table": "flow_state",
    "foreign_column": "id"
  },
  {
    "table_name": "one_time_tokens",
    "column_name": "user_id",
    "foreign_table": "users",
    "foreign_column": "id"
  },
  {
    "table_name": "s3_multipart_uploads",
    "column_name": "bucket_id",
    "foreign_table": "buckets",
    "foreign_column": "id"
  },
  {
    "table_name": "s3_multipart_uploads_parts",
    "column_name": "upload_id",
    "foreign_table": "s3_multipart_uploads",
    "foreign_column": "id"
  },
  {
    "table_name": "s3_multipart_uploads_parts",
    "column_name": "bucket_id",
    "foreign_table": "buckets",
    "foreign_column": "id"
  }
]
[
  {
    "id": "c752a3db-c549-4e01-ac2d-fe6e79f34083",
    "username": "aryan",
    "bio": "hiii",
    "is_online": true,
    "likes_count": 0,
    "created_at": "2025-03-24 04:22:47.920348+00",
    "updated_at": "2025-03-26 06:01:51.025+00",
    "avatar_url": null
  },
  {
    "id": "b6dca73d-1807-4249-b28c-670a9d29505f",
    "username": "roshani",
    "bio": "dsfsfsfs",
    "is_online": false,
    "likes_count": 1,
    "created_at": "2025-03-24 07:37:28.00782+00",
    "updated_at": "2025-03-24 07:38:11.687+00",
    "avatar_url": null
  },
  {
    "id": "7bad0693-9053-423f-a2f0-a61c20b9cbf4",
    "username": "roshan_kumar",
    "bio": "hi",
    "is_online": false,
    "likes_count": 19,
    "created_at": "2025-03-24 06:14:06.70781+00",
    "updated_at": "2025-03-26 13:19:46.023+00",
    "avatar_url": ""
  }
]