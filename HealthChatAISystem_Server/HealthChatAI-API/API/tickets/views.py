from rest_framework.parsers import MultiPartParser, FormParser, FileUploadParser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from .serializers import *
from .models import *
from accounts.models import *
from accounts.serializers import *
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.http import FileResponse, Http404
from django.views import View
import shutil
from django.conf import settings
import uuid
import uuid
import os


class DownloadFileView(APIView):
    def is_valid_uuid(self, val):
        try:
            uuid.UUID(str(val))
            return True
        except ValueError:
            return False

    def get(self, request, file_id):
        # Check if the file_id is a valid UUID
        if not self.is_valid_uuid(file_id):
            raise Http404("Invalid file_id")

        # Get the authenticated user's information
        serializer = OnlyUserProfileSerializer(request.user)
        user_id = serializer.data.get("id")

        # Retrieve the file using UUID
        file_obj = get_object_or_404(File, id=uuid.UUID(file_id))
        ticket = get_object_or_404(Ticket, pk=file_obj.ticket_id)

        # Check if the user has permission to access the file
        check_root_user = ticket.creator_id == user_id
        check_assigned_med_user = user_id == ticket.opened_by_med_id

        if ticket.is_open:
            # Only a medical user or root user can open a ticket
            if serializer.data.get("is_med_user") or check_root_user:
                flag = True
            else:
                flag = False
        else:
            # Check if the user is assigned to the ticket or is a root user
            if check_assigned_med_user or check_root_user:
                flag = True
            else:
                flag = False

        if flag:
            try:
                file_path = file_obj.file.path
                response = FileResponse(open(file_path, "rb"))
                response["Content-Type"] = file_obj.content_type
                response[
                    "Content-Disposition"
                ] = f'attachment; filename="{os.path.basename(file_path)}"'
                return response
            except FileNotFoundError:
                # File not found, return a 404 response
                raise Http404("File not found")
        else:
            return Response(
                {"detail": "Access Denied"}, status=status.HTTP_403_FORBIDDEN
            )


class DownloadFollowupFileView(APIView):
    def is_valid_uuid(self, val):
        try:
            uuid.UUID(str(val))
            return True
        except ValueError:
            return False

    def get(self, request, file_id):
        # Check if the file_id is a valid UUID
        if not self.is_valid_uuid(file_id):
            raise Http404("Invalid file_id")

        # Get the authenticated user's information
        serializer = OnlyUserProfileSerializer(request.user)
        user_id = serializer.data.get("id")

        # Retrieve the file using UUID
        file_obj = get_object_or_404(FollowupFile, id=uuid.UUID(file_id))
        ticket_fu = get_object_or_404(TicketFollowUp, pk=file_obj.ticket_fu_id)
        ticket = get_object_or_404(Ticket, pk=ticket_fu.root_id)

        # Check if the user has permission to access the file
        check_root_user = ticket.creator_id == user_id
        check_assigned_med_user = user_id == ticket.opened_by_med_id

        if check_assigned_med_user or check_root_user:
            try:
                file_path = file_obj.file.path
                response = FileResponse(open(file_path, "rb"))
                response["Content-Type"] = "application/octet-stream"
                response[
                    "Content-Disposition"
                ] = f'attachment; filename="{file_path.split("/")[-1]}"'
                return response
            except FileNotFoundError:
                # File not found, return a 404 response
                raise Http404("File not found")
        else:
            return Response(
                {"detail": "Access Denied"}, status=status.HTTP_403_FORBIDDEN
            )


##### TICKET VIEWS #####


class TicketCreateView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def post(self, request, format=None):
        serializer = OnlyUserProfileSerializer(request.user)
        if not serializer["is_med_user"].value:
            user_id = serializer["id"].value
            # Serialize the RegUser data
            data = request.data.copy()
            data["creator_id"] = user_id
            data["creator"] = user_id
            data["is_open"] = True
            data["is_archived"] = False
            files_data = data.pop("files", None)  # Extract files data

            # Handle multiple file uploads
            ticket_serializer = TicketSerializer(data=data)
            if ticket_serializer.is_valid(raise_exception=True):
                ticket = ticket_serializer.save()

                if files_data:
                    allimages = request.FILES.getlist("files")
                    print(allimages)
                    for oneimage in allimages:
                        File.objects.create(
                            file=oneimage,
                            ticket=ticket,
                            content_type=oneimage.content_type,
                        )

                return Response(ticket_serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response(
                    ticket_serializer.errors, status=status.HTTP_400_BAD_REQUEST
                )
        else:
            return Response(
                {"detail": "Access Denied"}, status=status.HTTP_403_FORBIDDEN
            )


class TicketArchiveView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, ticket_id, format=None):
        serializer = OnlyUserProfileSerializer(request.user)
        user_id = serializer["id"].value

        # Check if the ticket exists
        try:
            ticket = Ticket.objects.get(pk=ticket_id)
        except Ticket.DoesNotExist:
            return Response(
                {"error": "Ticket not found."}, status=status.HTTP_404_NOT_FOUND
            )

        check_assigned_med_user = user_id == ticket.opened_by_med_id
        check_root_user = ticket.creator_id == user_id
        if check_assigned_med_user or check_root_user:
            # Serialize the User data
            data = request.data.copy()

            # Create the serializer with partial=True to allow partial updates
            serializer = TicketArchiveSerializer(
                ticket, data=request.data, partial=True
            )

            if serializer.is_valid(raise_exception=True):
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(
                {"detail": "Access Denied"}, status=status.HTTP_403_FORBIDDEN
            )


class TicketUnarchiveView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, ticket_id, format=None):
        serializer = OnlyUserProfileSerializer(request.user)
        user_id = serializer["id"].value

        # Check if the ticket exists
        try:
            ticket = Ticket.objects.get(pk=ticket_id)
        except Ticket.DoesNotExist:
            return Response(
                {"error": "Ticket not found."}, status=status.HTTP_404_NOT_FOUND
            )

        check_assigned_med_user = user_id == ticket.opened_by_med_id
        check_root_user = ticket.creator_id == user_id
        if check_assigned_med_user or check_root_user:
            # Serialize the User data
            data = request.data.copy()

            # Create the serializer with partial=True to allow partial updates
            serializer = TicketUnarchiveSerializer(
                ticket, data=request.data, partial=True
            )

            if serializer.is_valid(raise_exception=True):
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(
                {"detail": "Access Denied"}, status=status.HTTP_403_FORBIDDEN
            )


class TicketUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, ticket_id, format=None):
        serializer = OnlyUserProfileSerializer(request.user)
        if not serializer["is_med_user"].value:
            # Check if the ticket exists
            try:
                ticket = Ticket.objects.get(pk=ticket_id)
            except Ticket.DoesNotExist:
                return Response(
                    {"error": "Ticket not found."}, status=status.HTTP_404_NOT_FOUND
                )

            user_id = serializer["id"].value
            data = request.data
            try:
                files_data = data.pop("files", None)  # Extract files data
            except:
                files_data = 0

            # Ensure that the user is the owner of the ticket (if needed)
            if ticket.creator_id != user_id:
                return Response(
                    {"error": "User does not own this ticket."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            # Create the serializer with partial=True to allow partial updates
            ticket_serializer = TicketUpdateSerializer(ticket, data=data, partial=True)

            if ticket_serializer.is_valid(raise_exception=True):
                ticket = ticket_serializer.save()

                for old_file in File.objects.filter(ticket_id=ticket_id):
                    if old_file.file:
                        old_file.delete()

                if files_data:
                    allimages = request.FILES.getlist("files")
                    print(allimages)
                    for oneimage in allimages:
                        File.objects.create(
                            file=oneimage,
                            ticket=ticket,
                            content_type=oneimage.content_type,
                        )

                return Response(ticket_serializer.data)
            return Response(
                ticket_serializer.errors, status=status.HTTP_400_BAD_REQUEST
            )
        else:
            return Response(
                {"detail": "Access Denied"}, status=status.HTTP_403_FORBIDDEN
            )


class TicketDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, ticket_id, format=None):
        # Check if the user exists
        serializer = OnlyUserProfileSerializer(request.user)

        if not serializer["is_med_user"].value:
            # Check if the ticket exists
            try:
                ticket = Ticket.objects.get(pk=ticket_id)
            except Ticket.DoesNotExist:
                return Response(
                    {"error": "Ticket not found."}, status=status.HTTP_404_NOT_FOUND
                )

            # Ensure that the user is the owner of the ticket (if needed)
            user_id = serializer["id"].value
            if ticket.creator_id != user_id:
                return Response(
                    {"error": "User does not own this ticket."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            ticket = Ticket.objects.get(pk=ticket_id)
            # Delete the associated files (assuming a FileField named 'attachment')
            # Delete the folder associated with the ticket_id
            folder_path = os.path.join(
                settings.MEDIA_ROOT, f"file_uploads/ticket/{ticket_id}"
            )
            shutil.rmtree(folder_path)

            # Delete the ticket
            ticket.delete()
            return Response({"message": "Ticket deleted."}, status=status.HTTP_200_OK)
        else:
            return Response(
                {"detail": "Access Denied"}, status=status.HTTP_403_FORBIDDEN
            )


##### REG-USER TICKET VIEWS #####


class RegUserTicketListView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = PageNumberPagination

    def get(self, request):
        serializer = OnlyUserProfileSerializer(request.user)

        if not serializer["is_med_user"].value:
            user_id = serializer["id"].value
            tickets = Ticket.objects.filter(creator_id=user_id)

            paginator = PageNumberPagination()
            paginator.page_size = 10  # Set the number of items per page

            page = paginator.paginate_queryset(tickets, request)

            serializer = TicketSerializer(page, many=True)

            # Include related files for each ticket
            serialized_data = serializer.data

            for ticket_data in serialized_data:
                ticket_id = ticket_data["id"]
                ticket_files = File.objects.filter(ticket=ticket_id)
                file_urls = [file.file.url for file in ticket_files]

                ticket_data["files"] = file_urls
            for ticket_data in serialized_data:
                ticket_id = ticket_data["id"]
                ticket_files = File.objects.filter(ticket=ticket_id)
                # file_urls = [file.file.url for file in ticket_files]

                # ticket_data["files"] = file_urls

                file_info_list = [
                    {
                        "url": file.file.url,
                        "uuid": file.id,
                        "filename": os.path.basename(file.file.path),
                    }
                    for file in ticket_files
                ]

                ticket_data["files"] = file_info_list
            # Return the paginated response with files
            return paginator.get_paginated_response(serialized_data)

        else:
            return Response(
                {"error": "Access Denied"}, status=status.HTTP_404_NOT_FOUND
            )


##### MED-USER TICKET VIEWS #####


class MedUserOpenTicketListView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = PageNumberPagination

    def get(self, request):
        serializer = OnlyUserProfileSerializer(request.user)
        if serializer["is_med_user"].value:
            tickets = Ticket.objects.filter(Q(is_open=True) & Q(is_archived=False))

            paginator = PageNumberPagination()
            paginator.page_size = 10  # Set the number of items per page

            page = paginator.paginate_queryset(tickets, request)

            serializer = TicketSerializer(page, many=True)

            # Include related files for each ticket
            serialized_data = serializer.data

            for ticket_data in serialized_data:
                ticket_id = ticket_data["id"]
                ticket_files = File.objects.filter(ticket=ticket_id)
                # file_urls = [file.file.url for file in ticket_files]

                # ticket_data["files"] = file_urls

                file_info_list = [
                    {"url": file.file.url, "uuid": file.id} for file in ticket_files
                ]

                ticket_data["files"] = file_info_list

            # Return the paginated response with files
            return paginator.get_paginated_response(serialized_data)
        else:
            return Response(
                {"error": "Access Denied"}, status=status.HTTP_403_FORBIDDEN
            )


class MedUserCloseTicketListView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = PageNumberPagination

    def get(self, request):
        serializer = OnlyUserProfileSerializer(request.user)
        if serializer["is_med_user"].value:
            tickets = Ticket.objects.filter(
                Q(opened_by_med_id=serializer.data["id"]) & Q(is_archived=False)
            )

            paginator = PageNumberPagination()
            paginator.page_size = 10  # Set the number of items per page

            page = paginator.paginate_queryset(tickets, request)

            serializer = TicketSerializer(page, many=True)

            # Include related files for each ticket
            serialized_data = serializer.data

            for ticket_data in serialized_data:
                ticket_id = ticket_data["id"]
                ticket_files = File.objects.filter(ticket=ticket_id)
                # file_urls = [file.file.url for file in ticket_files]

                # ticket_data["files"] = file_urls

                file_info_list = [
                    {"url": file.file.url, "uuid": file.id} for file in ticket_files
                ]

                ticket_data["files"] = file_info_list

            # Return the paginated response with files
            return paginator.get_paginated_response(serialized_data)
        else:
            return Response(
                {"error": "Access Denied"}, status=status.HTTP_403_FORBIDDEN
            )


##### FOLLOWUP TICKETS VIEW #####


class TicketFollowupCreateView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def post(self, request, ticket_id, format=None):
        serializer = OnlyUserProfileSerializer(request.user)
        user_id = serializer["id"].value

        ticket = get_object_or_404(Ticket, pk=ticket_id)

        if ticket.is_open:
            # only medical user can open a ticket
            if serializer["is_med_user"].value:
                # Serialize the RegUser data
                data = request.data.copy()
                data["creator_id"] = user_id
                data["root"] = ticket_id
                data["is_medUser"] = serializer["is_med_user"].value
                files_data = data.pop("files", None)  # Extract files data

                serializer = TicketFollowUpSerializer(data=data)

                if serializer.is_valid():
                    ticket_fu = serializer.save()
                    if files_data:
                        allimages = request.FILES.getlist("files")
                        for oneimage in allimages:
                            FollowupFile.objects.create(
                                file=oneimage,
                                ticket_fu=ticket_fu,
                                content_type=oneimage.content_type,
                            )

                    ticket.is_open = False
                    ticket.opened_by_med_id = user_id
                    ticket.save()
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
                else:
                    return Response(
                        serializer.errors, status=status.HTTP_400_BAD_REQUEST
                    )

            else:
                return Response(
                    {"detail": "Access Denied"}, status=status.HTTP_403_FORBIDDEN
                )
        else:
            check_root_user = ticket.creator_id == user_id
            check_assigned_med_user = user_id == ticket.opened_by_med_id
            if check_assigned_med_user or check_root_user:
                # Serialize the User data
                data = request.data.copy()
                data["creator_id"] = user_id
                data["root"] = ticket.id
                data["is_medUser"] = serializer["is_med_user"].value
                files_data = data.pop("files", None)  # Extract files data

                serializer = TicketFollowUpSerializer(data=data)

                if serializer.is_valid(raise_exception=True):
                    ticket_fu = serializer.save()
                    if files_data:
                        allimages = request.FILES.getlist("files")
                        print(allimages)
                        for oneimage in allimages:
                            FollowupFile.objects.create(
                                file=oneimage,
                                ticket_fu=ticket_fu,
                                content_type=oneimage.content_type,
                            )

                    return Response(serializer.data, status=status.HTTP_201_CREATED)
                else:
                    return Response(
                        serializer.errors, status=status.HTTP_400_BAD_REQUEST
                    )

            else:
                return Response(
                    {"detail": "Not allowed to follow-up"},
                    status=status.HTTP_400_BAD_REQUEST,
                )


class TicketFollowupUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, ticket_fu_id, format=None):
        serializer = OnlyUserProfileSerializer(request.user)
        # Check if the ticket exists
        try:
            ticket_fu = TicketFollowUp.objects.get(pk=ticket_fu_id)
        except TicketFollowUp.DoesNotExist:
            return Response(
                {"error": "Ticket not found."}, status=status.HTTP_404_NOT_FOUND
            )

        user_id = serializer["id"].value
        # Ensure that the user is the owner of the ticket (if needed)
        if ticket_fu.creator_id != user_id:
            return Response(
                {"error": "User does not own this ticket."},
                status=status.HTTP_403_FORBIDDEN,
            )

        data = request.data
        try:
            files_data = data.pop("files", None)  # Extract files data
        except:
            files_data = 0
        # Create the serializer with partial=True to allow partial updates
        serializer = TicketFollowupUpdateSerializer(ticket_fu, data=data, partial=True)

        if serializer.is_valid(raise_exception=True):
            serializer.save()

            for old_file in FollowupFile.objects.filter(ticket_fu_id=ticket_fu_id):
                if old_file.file:
                    old_file.delete()

            if files_data:
                allimages = request.FILES.getlist("files")
                print(allimages)
                for oneimage in allimages:
                    FollowupFile.objects.create(
                        file=oneimage,
                        ticket_fu=ticket_fu,
                        content_type=oneimage.content_type,
                    )

            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TicketFollowupDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, ticket_fu_id, format=None):
        # Check if the user exists
        serializer = OnlyUserProfileSerializer(request.user)

        # Check if the ticket exists
        try:
            ticket_fu = TicketFollowUp.objects.get(pk=ticket_fu_id)
        except TicketFollowUp.DoesNotExist:
            return Response(
                {"error": "Ticket not found."}, status=status.HTTP_404_NOT_FOUND
            )

        # Ensure that the user is the owner of the ticket (if needed)
        user_id = serializer["id"].value
        if ticket_fu.creator_id != user_id:
            return Response(
                {"error": "Access Denied"},
                status=status.HTTP_403_FORBIDDEN,
            )

        ticket_fu = TicketFollowUp.objects.get(pk=ticket_fu_id)
        # Delete the associated files (assuming a FileField named 'attachment')
        folder_path = os.path.join(
            settings.MEDIA_ROOT, f"file_uploads/ticketfollowup/{ticket_fu_id}"
        )
        shutil.rmtree(folder_path)

        # Delete the ticket
        ticket_fu.delete()
        return Response({"message": "Ticket deleted."}, status=status.HTTP_200_OK)


##### THIS LIST VIEW FOR BOTH REG-USER(CREATED_BY) AND MED-USER(OPENED BY) #####
class TicketFollowupListView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = PageNumberPagination

    def get(self, request, ticket_id):
        serializer = OnlyUserProfileSerializer(request.user)
        user_id = serializer["id"].value
        try:
            ticket = Ticket.objects.get(pk=ticket_id)
        except Ticket.DoesNotExist:
            return Response(
                {"error": "Ticket not found."}, status=status.HTTP_404_NOT_FOUND
            )

        # Ensure that the user is the owner of the ticket (if needed)
        user_id = serializer["id"].value
        if ticket.creator_id != user_id and ticket.opened_by_med_id != user_id:
            return Response(
                {"error": "Access Denied"},
                status=status.HTTP_403_FORBIDDEN,
            )

        tickets = TicketFollowUp.objects.filter(root=ticket_id).order_by(
            "sequence_number"
        )

        paginator = PageNumberPagination()
        paginator.page_size = 10  # Set the number of items per page

        page = paginator.paginate_queryset(tickets, request)

        # Serialize the paginated data
        followup_serializer = TicketFollowUpSerializer(page, many=True)

        serialized_data = followup_serializer.data

        for ticket_data in serialized_data:
            ticket_id = ticket_data["id"]
            ticket_files = FollowupFile.objects.filter(ticket_fu=ticket_id)

            file_info_list = [
                {"url": file.file.url, "uuid": file.id} for file in ticket_files
            ]

            ticket_data["files"] = file_info_list

        #     ########
        # for ticket_data in serialized_data:
        #         ticket_id = ticket_data["id"]
        #         ticket_files = File.objects.filter(ticket=ticket_id)
        #         # file_urls = [file.file.url for file in ticket_files]

        #         # ticket_data["files"] = file_urls

        #         file_info_list = [
        #             {"url": file.file.url, "uuid": file.id} for file in ticket_files
        #         ]

        #         ticket_data["files"] = file_info_list

        ticket_serializer = TicketSerializer(ticket)
        ticket_data = ticket_serializer.data
        ticket_id = ticket_data["id"]

        # Debugging: Print the ticket ID
        print("Ticket ID:", ticket_id)

        # Query the File model
        ticket_files = File.objects.filter(ticket=ticket_id)

        # Debugging: Print the number of files associated with the ticket
        print("Number of Files:", ticket_files.count())

        file_info_list = [
            {"url": file.file.url, "uuid": file.id} for file in ticket_files
        ]

        ticket_data["files"] = file_info_list

        ticket_data["files"] = file_info_list

        response_data = {
            "ticket_details": ticket_data,
            "followup_data": followup_serializer.data,
        }
        # Return the paginated response
        return paginator.get_paginated_response(response_data)
