import React, { useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "../../../../hooks/useApi";
import UserBasicInfoTab from "./UserBasicInfoTab";
import UserRoleInfoTab from "./UserRoleInfoTab";
import UserGroupInfoTab from "./UserGroupInfoTab";

export type UserDetailType = {
  id: string;
  username: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  updated_at: string;
};

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [error, setError] = useState("");
  const { get } = useApi();
  const queryClient = useQueryClient();

  const fetchUserDetail = async (userId: string): Promise<UserDetailType> => {
    return get<UserDetailType>(`/users/${userId}`);
  };

  const { data: user, isLoading } = useQuery<UserDetailType>({
    queryKey: ["userDetail", id],
    queryFn: () => fetchUserDetail(id!),
    enabled: !!id,
  });

  const randomLoginDate = new Date(
    Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30),
  )
    .toISOString()
    .replace("T", " ")
    .slice(0, 19);

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height={400}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} mb={1}>
        사용자 조회
      </Typography>
      <Typography variant="body2" color="textSecondary" mb={3}>
        사용자의 기본 정보, 역할, 그룹 소속, 권한 정보를 한눈에 확인할 수
        있습니다.
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="기본정보" />
        <Tab label="역할정보" />
        <Tab label="그룹정보" />
      </Tabs>

      {tab === 0 && (
        <UserBasicInfoTab user={user!} randomLoginDate={randomLoginDate} />
      )}
      {tab === 1 && user?.id && <UserRoleInfoTab userId={user.id} />}
      {tab === 2 && user?.id && <UserGroupInfoTab userId={user.id} />}

      {error && (
        <Box mt={2}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}
    </Box>
  );
};

export default UserDetail;
