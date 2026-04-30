import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotifications, markAsRead } from "../api/notification.js";

export const useNotifications = () => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
