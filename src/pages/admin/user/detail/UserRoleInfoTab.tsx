import React, { useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "../../../../hooks/useApi";
import RoleAssignModal from "../../role/detail/RoleAssignModal";

interface RoleItem {
  project: {
    id: string;
    name: string;
  };
  role: {
    id: string;
    name: string;
    description: string | null;
  };
}

interface RoleResponse {
  data: RoleItem[];
}

interface UserRoleInfoTabProps {
  userId: string;
}

const UserRoleInfoTab: React.FC<UserRoleInfoTabProps> = ({ userId }) => {
  const { get } = useApi();
  const [openModal, setOpenModal] = useState(false);

  const fetchRoles = async (): Promise<RoleItem[]> => {
    const response = await get<RoleResponse>(
      `/users/${userId}/role-mappings?page=1&size=10`,
    );
    return response.data;
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["userRoleMappings", userId],
    queryFn: fetchRoles,
    enabled: !!userId,
  });

  return (
    <Box>
      <Paper variant="outlined" sx={{ mt: 2, p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" fontWeight={700}>
            역할 정보
          </Typography>
          <Button variant="contained" onClick={() => setOpenModal(true)}>
            역할 할당하기
          </Button>
        </Box>

        {isLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error">역할 정보를 불러오는 데 실패했습니다.</Alert>
        ) : (data?.length ?? 0) === 0 ? (
          <Typography mt={2}>할당된 역할이 없습니다.</Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>NO</TableCell>
                <TableCell>역할명</TableCell>
                <TableCell>유형</TableCell>
                <TableCell>역할 설명</TableCell>
                <TableCell>최종 업데이트</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data!.map((item, idx) => (
                <TableRow key={`${item.role.id}-${item.project.id}`}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{item.role.name}</TableCell>
                  <TableCell>{item.project.name}</TableCell>
                  <TableCell>{item.role.description ?? "-"}</TableCell>
                  <TableCell>-</TableCell> {/* 날짜 없음 */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <RoleAssignModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        userId={userId}
      />
    </Box>
  );
};

export default UserRoleInfoTab;
