


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."account_type_enum" AS ENUM (
    'checking',
    'savings'
);


ALTER TYPE "public"."account_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."card_brand_enum" AS ENUM (
    'visa',
    'visa_signature',
    'mastercard',
    'amex',
    'elo',
    'hipercard'
);


ALTER TYPE "public"."card_brand_enum" OWNER TO "postgres";


CREATE TYPE "public"."category_enum" AS ENUM (
    'alimentacao',
    'moradia',
    'transporte',
    'saude',
    'lazer',
    'assinaturas',
    'compras',
    'salario',
    'renda_extra',
    'investimento',
    'outros'
);


ALTER TYPE "public"."category_enum" OWNER TO "postgres";


CREATE TYPE "public"."invoice_status_enum" AS ENUM (
    'paid',
    'pending',
    'overdue',
    'open',
    'closed'
);


ALTER TYPE "public"."invoice_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."invoice_transaction_type_enum" AS ENUM (
    'single',
    'installment'
);


ALTER TYPE "public"."invoice_transaction_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."membership_tier_enum" AS ENUM (
    'free',
    'premium'
);


ALTER TYPE "public"."membership_tier_enum" OWNER TO "postgres";


CREATE TYPE "public"."notification_type_enum" AS ENUM (
    'due_soon',
    'overdue',
    'limit',
    'payment'
);


ALTER TYPE "public"."notification_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."payment_method_enum" AS ENUM (
    'credit',
    'debit',
    'pix',
    'transfer',
    'cash'
);


ALTER TYPE "public"."payment_method_enum" OWNER TO "postgres";


CREATE TYPE "public"."theme_enum" AS ENUM (
    'light',
    'dark'
);


ALTER TYPE "public"."theme_enum" OWNER TO "postgres";


CREATE TYPE "public"."transaction_type_enum" AS ENUM (
    'expense',
    'income',
    'transfer'
);


ALTER TYPE "public"."transaction_type_enum" OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."bank_accounts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "bankname" "text" NOT NULL,
    "accounttype" "text" NOT NULL,
    "accountnumber" "text" NOT NULL,
    "branch" "text" NOT NULL,
    "balance" numeric DEFAULT 0 NOT NULL,
    "logourl" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."bank_accounts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."budgets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "category" "text" NOT NULL,
    "amount" numeric NOT NULL,
    "month" smallint NOT NULL,
    "year" integer NOT NULL
);


ALTER TABLE "public"."budgets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."card_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "card_id" "uuid" NOT NULL,
    "alertthreshold" numeric DEFAULT 0.8 NOT NULL
);


ALTER TABLE "public"."card_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cards" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "nickname" "text" NOT NULL,
    "brand" "text" NOT NULL,
    "last4" "text" NOT NULL,
    "holdername" "text" NOT NULL,
    "expiration" "text" NOT NULL,
    "limit" numeric NOT NULL,
    "duedateday" smallint NOT NULL,
    "closingday" smallint,
    "gradient" "jsonb" DEFAULT '{"end": "#1F2937", "start": "#4B5563"}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."cards" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."goals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "targetamount" numeric NOT NULL,
    "currentamount" numeric DEFAULT 0 NOT NULL,
    "targetdate" "text" NOT NULL
);


ALTER TABLE "public"."goals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invoice_payments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "invoiceid" "uuid" NOT NULL,
    "cardid" "uuid" NOT NULL,
    "amount" numeric NOT NULL,
    "dateiso" "text" NOT NULL,
    "method" "text",
    "notes" "text"
);


ALTER TABLE "public"."invoice_payments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invoices" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "cardid" "uuid" NOT NULL,
    "month" "text" NOT NULL,
    "year" integer NOT NULL,
    "totalamount" numeric DEFAULT 0 NOT NULL,
    "duedate" "text" NOT NULL,
    "paymentdate" "text",
    "status" "text" NOT NULL,
    "transactions" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "installments" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "paidamount" numeric DEFAULT 0
);


ALTER TABLE "public"."invoices" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "dateiso" "text" NOT NULL,
    "read" boolean DEFAULT false NOT NULL,
    "invoiceid" "uuid",
    "cardid" "uuid"
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."recurrences" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "description" "text" NOT NULL,
    "amount" numeric NOT NULL,
    "category" "text" NOT NULL,
    "cardid" "uuid" NOT NULL,
    "dayofmonth" smallint NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "startdate" "text" NOT NULL,
    "enddate" "text",
    "lastrunmonth" "text"
);


ALTER TABLE "public"."recurrences" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "description" "text" NOT NULL,
    "category" "text" NOT NULL,
    "amount" numeric NOT NULL,
    "date" "text" NOT NULL,
    "type" "text" NOT NULL,
    "paymentmethod" "text" NOT NULL,
    "sourceid" "text" NOT NULL,
    "card_id" "uuid",
    "bank_account_id" "uuid",
    "isinstallment" boolean DEFAULT false NOT NULL,
    "installment" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "avatarurl" "text",
    "membership" "text" DEFAULT 'Free'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."bank_accounts"
    ADD CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."budgets"
    ADD CONSTRAINT "budgets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."card_settings"
    ADD CONSTRAINT "card_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cards"
    ADD CONSTRAINT "cards_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."goals"
    ADD CONSTRAINT "goals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invoice_payments"
    ADD CONSTRAINT "invoice_payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."recurrences"
    ADD CONSTRAINT "recurrences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bank_accounts"
    ADD CONSTRAINT "bank_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."budgets"
    ADD CONSTRAINT "budgets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."card_settings"
    ADD CONSTRAINT "card_settings_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."card_settings"
    ADD CONSTRAINT "card_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cards"
    ADD CONSTRAINT "cards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."goals"
    ADD CONSTRAINT "goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invoice_payments"
    ADD CONSTRAINT "invoice_payments_cardid_fkey" FOREIGN KEY ("cardid") REFERENCES "public"."cards"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invoice_payments"
    ADD CONSTRAINT "invoice_payments_invoiceid_fkey" FOREIGN KEY ("invoiceid") REFERENCES "public"."invoices"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_cardid_fkey" FOREIGN KEY ("cardid") REFERENCES "public"."cards"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_cardid_fkey" FOREIGN KEY ("cardid") REFERENCES "public"."cards"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_invoiceid_fkey" FOREIGN KEY ("invoiceid") REFERENCES "public"."invoices"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recurrences"
    ADD CONSTRAINT "recurrences_cardid_fkey" FOREIGN KEY ("cardid") REFERENCES "public"."cards"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recurrences"
    ADD CONSTRAINT "recurrences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "public"."bank_accounts"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";








































































































































































GRANT ALL ON TABLE "public"."bank_accounts" TO "anon";
GRANT ALL ON TABLE "public"."bank_accounts" TO "authenticated";
GRANT ALL ON TABLE "public"."bank_accounts" TO "service_role";



GRANT ALL ON TABLE "public"."budgets" TO "anon";
GRANT ALL ON TABLE "public"."budgets" TO "authenticated";
GRANT ALL ON TABLE "public"."budgets" TO "service_role";



GRANT ALL ON TABLE "public"."card_settings" TO "anon";
GRANT ALL ON TABLE "public"."card_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."card_settings" TO "service_role";



GRANT ALL ON TABLE "public"."cards" TO "anon";
GRANT ALL ON TABLE "public"."cards" TO "authenticated";
GRANT ALL ON TABLE "public"."cards" TO "service_role";



GRANT ALL ON TABLE "public"."goals" TO "anon";
GRANT ALL ON TABLE "public"."goals" TO "authenticated";
GRANT ALL ON TABLE "public"."goals" TO "service_role";



GRANT ALL ON TABLE "public"."invoice_payments" TO "anon";
GRANT ALL ON TABLE "public"."invoice_payments" TO "authenticated";
GRANT ALL ON TABLE "public"."invoice_payments" TO "service_role";



GRANT ALL ON TABLE "public"."invoices" TO "anon";
GRANT ALL ON TABLE "public"."invoices" TO "authenticated";
GRANT ALL ON TABLE "public"."invoices" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."recurrences" TO "anon";
GRANT ALL ON TABLE "public"."recurrences" TO "authenticated";
GRANT ALL ON TABLE "public"."recurrences" TO "service_role";



GRANT ALL ON TABLE "public"."transactions" TO "anon";
GRANT ALL ON TABLE "public"."transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."transactions" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































