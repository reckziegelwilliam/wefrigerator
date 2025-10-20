-- Create storage bucket for photos
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true);

-- Storage policies for photos bucket
create policy "Photos are publicly accessible"
on storage.objects for select
using (bucket_id = 'photos');

create policy "Authenticated users can upload photos"
on storage.objects for insert
with check (
  bucket_id = 'photos' 
  and auth.uid() is not null
);

create policy "Users can update own photos"
on storage.objects for update
using (
  bucket_id = 'photos' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete own photos"
on storage.objects for delete
using (
  bucket_id = 'photos' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

