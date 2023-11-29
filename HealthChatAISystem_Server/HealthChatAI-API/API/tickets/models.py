from django.db import models

# Create your models here.
from django.db import models
from accounts.models import User

from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
import uuid
import os


def ticket_file_path(instance, filename):
    # Construct the path dynamically using ticket_id and the original file name
    return f"file_uploads/ticket/{instance.ticket_id}/{filename}"


def ticket_fu_file_path(instance, filename):
    # Construct the path dynamically using ticket_id and the original file name
    return f"file_uploads/ticketfollowup/{instance.ticket_fu_id}/{filename}"


# Custom validator to check file size
def validate_file_size(value):
    max_file_size = 4 * 1024 * 1024  # 4MB in bytes
    if value.size > max_file_size:
        raise ValidationError(_("File size exceeds the maximum limit of 4MB."))


# Create your models here.


class Ticket(models.Model):
    creator = models.ForeignKey(User, on_delete=models.CASCADE)
    description = models.TextField()
    # FileField for multiple files/
    # files = models.ManyToManyField(File, blank=True, null=True)
    is_open = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, db_column="timestamp")
    updated_at = models.DateTimeField(auto_now=True)
    opened_by_med_id = models.IntegerField(null=True, blank=True)
    is_archived = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        # Handle multiple files (if needed)
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        # Call the parent class's delete method to delete the database record
        super().delete(*args, **kwargs)


class File(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE)
    file = models.FileField(upload_to=ticket_file_path, default="")
    content_type = models.CharField(null=True, blank=True, max_length=100)

    def delete(self, *args, **kwargs):
        # Delete the associated file from the folder
        if self.file and os.path.isfile(self.file.path):
            os.remove(self.file.path)

        super().delete(*args, **kwargs)


# Create your models here.
class TicketFollowUp(models.Model):
    root = models.ForeignKey(Ticket, on_delete=models.CASCADE)
    creator = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    sequence_number = models.IntegerField()
    is_medUser = models.BooleanField()
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True, db_column="timestamp")
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Calculate the sequence number based on the 'root' field and existing records
        if not self.sequence_number:
            last_record = (
                TicketFollowUp.objects.filter(root=self.root)
                .order_by("-sequence_number")
                .first()
            )
            if last_record:
                self.sequence_number = last_record.sequence_number + 1
            else:
                self.sequence_number = 1
        # super(TicketFollowUp, self).save(*args, **kwargs)
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        # Call the parent class's delete method to delete the database record
        super().delete(*args, **kwargs)


class FollowupFile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket_fu = models.ForeignKey(TicketFollowUp, on_delete=models.CASCADE)
    file = models.FileField(upload_to=ticket_fu_file_path, default="")

    def delete(self, *args, **kwargs):
        # Delete the associated file from the folder
        if self.file and os.path.isfile(self.file.path):
            os.remove(self.file.path)

        super().delete(*args, **kwargs)
