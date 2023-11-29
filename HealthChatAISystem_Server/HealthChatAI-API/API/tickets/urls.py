from django.urls import path
from .views import *

urlpatterns = [
    path("create/", TicketCreateView.as_view(), name="create-ticket"),
    path("<int:ticket_id>/update/", TicketUpdateView.as_view(), name="ticket-update"),
    path("<int:ticket_id>/delete/", TicketDeleteView.as_view(), name="delete-ticket"),
    path(
        "<int:ticket_id>/archive/", TicketArchiveView.as_view(), name="archive-ticket"
    ),
    path(
        "<int:ticket_id>/unarchive/",
        TicketUnarchiveView.as_view(),
        name="unarchive-ticket",
    ),
    path(
        "reg-user-list/", RegUserTicketListView.as_view(), name="reg-user-ticket-list"
    ),
    path(
        "med-user-open-list/",
        MedUserOpenTicketListView.as_view(),
        name="med-user-open-list",
    ),
    path(
        "med-user-close-list/",
        MedUserCloseTicketListView.as_view(),
        name="med-user-close-list",
    ),
    path(
        "download/<str:file_id>/",
        DownloadFileView.as_view(),
        name="download_file",
    ),
    path(
        "followup/download/<str:file_id>/",
        DownloadFollowupFileView.as_view(),
        name="download_fu_file",
    ),
    path(
        "<int:ticket_id>/followup/create/",
        TicketFollowupCreateView.as_view(),
        name="create-followup-ticket",
    ),  # in this past, ticket_id is the root ticket for all it's the followups
    path(
        "followup/<int:ticket_fu_id>/update/",
        TicketFollowupUpdateView.as_view(),
        name="ticket-followup-update",
    ),
    path(
        "followup/<int:ticket_fu_id>/delete/",
        TicketFollowupDeleteView.as_view(),
        name="delete-ticket-followup",
    ),
    path(
        "<int:ticket_id>/followup-list/",
        TicketFollowupListView.as_view(),
        name="followup-list",
    ),
]
