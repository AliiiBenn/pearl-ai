
CREATE TABLE "user_challenge_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"code" text NOT NULL,
	"language" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_challenge_codes" ADD CONSTRAINT "user_challenge_codes_document_id_Document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."Document"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_challenge_codes" ADD CONSTRAINT "user_challenge_codes_user_id_Chat_userId_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Chat"("userId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Document" ADD CONSTRAINT "Document_id_unique" UNIQUE("id");