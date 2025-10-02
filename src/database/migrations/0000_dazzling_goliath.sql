CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(100) NOT NULL,
	"parent" uuid
);
--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_parent_projects_id_fk" FOREIGN KEY ("parent") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;