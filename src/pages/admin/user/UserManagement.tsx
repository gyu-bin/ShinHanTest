import React, { useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../../hooks/useApi";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";

const PAGE_SIZE = 12;

type User = {
  id: string;
  username: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
};

type UserResponse = {
  data: User[];
  payload: {
    pagination: {
      page: number;
      total: number;
      last_page: number;
    };
  };
};

const UserManagement: React.FC = () => {
  const [page, setPage] = useState(1);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const open = Boolean(anchorEl);

  const navigate = useNavigate();
  const { get, delete: deleteUserApi } = useApi(); // ✅ 수정
  const queryClient = useQueryClient();

  const fetchUsers = async (page: number): Promise<UserResponse> => {
    return get<UserResponse>(`/users?page=${page}&size=${PAGE_SIZE}`);
  };

  const { data, isLoading } = useQuery<UserResponse, Error>({
    queryKey: ["userList", page],
    queryFn: () => fetchUsers(page),
    placeholderData: (prev) => prev,
  });

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    userId: string,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedUserId(userId);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedUserId(null);
  };

  const users = data?.data ?? [];
  const totalPages = data?.payload.pagination.last_page ?? 1;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={1}>
        사용자 관리
      </Typography>
      <Typography color="text.secondary" mb={3} fontSize={15}>
        플랫폼을 이용하는 모든 사용자 목록을 확인하고 관리할 수 있습니다.
      </Typography>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Button
          variant="contained"
          size="small"
          onClick={() => navigate("/admin/users/create")}
        >
          신규
        </Button>
        <TextField size="small" placeholder="이름 또는 행번 입력" />
      </Box>

      <Paper elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
        {isLoading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height={200}
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f4f6f8" }}>
                    <TableCell>이름</TableCell>
                    <TableCell>인사 상태</TableCell>
                    <TableCell>행번</TableCell>
                    <TableCell>부서</TableCell>
                    <TableCell>마지막 접속일시</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => {
                    const randomDate = new Date(
                      Date.now() -
                        Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30),
                    );
                    const formattedDate = randomDate
                      .toISOString()
                      .slice(0, 19)
                      .replace("T", " ");

                    return (
                      <TableRow
                        key={user.id}
                        hover
                        sx={{ cursor: "pointer" }}
                        onClick={() => navigate(`/admin/users/${user.id}`)}
                      >
                        <TableCell>{user.first_name ?? "-"}</TableCell>
                        <TableCell>재직</TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.last_name ?? "-"}</TableCell>
                        <TableCell>{formattedDate}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <Box display="flex" justifyContent="center" my={2}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                shape="rounded"
              />
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default UserManagement;
