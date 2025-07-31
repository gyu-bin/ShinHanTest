import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Tooltip,
  TextField,
  Card,
  CardContent,
  CardActionArea,
  Alert,
  Snackbar,
  Button
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Add as AddIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  Science as ScienceIcon,
  Code as CodeIcon
} from '@mui/icons-material';
import Editor from '@monaco-editor/react';

// Jupyter 서버 설정
const JUPYTER_SERVER_URL = 'http://127.0.0.1:8888/jupyter/lab';
// Docker Jupyter는 보통 토큰이 없으므로 빈 문자열로 설정
const JUPYTER_TOKEN = '';

interface JupyterKernel {
  id: string;
  name: string;
  last_activity: string;
  connections: number;
  execution_state: string;
}

interface JupyterSession {
  id: string;
  path: string;
  name: string;
  type: string;
  kernel: {
    id: string;
    name: string;
    last_activity: string;
    execution_state: string;
  };
}

interface JupyterCell {
  id: number;
  content: string;
  output: string;
  executed: boolean;
  executionCount: number | null;
}

type IDEView = 'select' | 'vscode' | 'jupyter';

const IDE: React.FC = () => {
  const [currentView, setCurrentView] = useState<IDEView>('select');
  const [jupyterConnected, setJupyterConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [jupyterCells, setJupyterCells] = useState<JupyterCell[]>([
    {
      id: 1,
      content: "# 여기에 Python 코드를 입력하세요...",
      output: '',
      executed: false,
      executionCount: null
    }
  ]);

  // Jupyter 서버 연결 확인 (iframe 사용으로 간단하게 처리)
  useEffect(() => {
    // iframe으로 Jupyter를 사용하므로 연결 상태를 true로 설정
    setJupyterConnected(true);
  }, []);

  const [jupyterSession, setJupyterSession] = useState<JupyterSession | null>(null);

  const checkJupyterConnection = async () => {
    // iframe으로 Jupyter를 사용하므로 연결 확인 불필요
    setJupyterConnected(true);
  };

  const createJupyterSession = async () => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (JUPYTER_TOKEN) {
        headers['Authorization'] = `token ${JUPYTER_TOKEN}`;
      }

      // 먼저 기존 세션이 있는지 확인
      const sessionsResponse = await fetch(`${JUPYTER_SERVER_URL}/api/sessions`, { headers });
      
      if (sessionsResponse.ok) {
        const sessions = await sessionsResponse.json();
        if (sessions.length > 0) {
          // 기존 세션 사용
          setJupyterSession(sessions[0]);
          return;
        }
      }

      // 기존 세션이 없으면 새로 생성
      const response = await fetch(`${JUPYTER_SERVER_URL}/api/sessions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          path: 'notebook.ipynb',
          type: 'notebook',
          kernel: { name: 'python3' }
        })
      });
      
      if (response.ok) {
        const session = await response.json();
        setJupyterSession(session);
      }
    } catch (error) {
      console.error('세션 생성 실패:', error);
    }
  };

  // 셀 실행 (실제 Jupyter API 호출)
  const executeCell = async (cellId: number) => {
    const cell = jupyterCells.find(c => c.id === cellId);
    if (!cell) return;

    try {
      // 실행 중 상태로 업데이트
      setJupyterCells(prevCells =>
        prevCells.map(c =>
          c.id === cellId ? { ...c, executed: true, executionCount: (c.executionCount || 0) + 1 } : c
        )
      );

      if (jupyterSession) {
        // 실제 Jupyter API 호출
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };
        
        if (JUPYTER_TOKEN) {
          headers['Authorization'] = `token ${JUPYTER_TOKEN}`;
        }

        const response = await fetch(`${JUPYTER_SERVER_URL}/api/sessions/${jupyterSession.id}/execute`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            code: cell.content,
            silent: false,
            store_history: true,
            user_expressions: {},
            allow_stdin: false
          })
        });

        if (response.ok) {
          const result = await response.json();
          
          // 결과 처리
          let output = '';
          if (result.content && result.content.text) {
            output = result.content.text;
          } else if (result.content && result.content.data) {
            output = result.content.data['text/plain'] || JSON.stringify(result.content.data);
          } else if (result.content && result.content.evalue) {
            output = `Error: ${result.content.evalue}`;
          }

          setJupyterCells(prevCells =>
            prevCells.map(c =>
              c.id === cellId ? { ...c, output, executed: true } : c
            )
          );
        } else {
          throw new Error('코드 실행 실패');
        }
      } else {
        // 세션이 없으면 시뮬레이션 실행
        const output = simulatePythonExecution(cell.content);
        setJupyterCells(prevCells =>
          prevCells.map(c =>
            c.id === cellId ? { ...c, output, executed: true } : c
          )
        );
      }
    } catch (error) {
      console.error('셀 실행 오류:', error);
      setJupyterCells(prevCells =>
        prevCells.map(c =>
          c.id === cellId ? { ...c, output: `Error: ${error}`, executed: true } : c
        )
      );
    }
  };

  // Python 코드 실행 시뮬레이션 (실제 구현시 제거)
  const simulatePythonExecution = (code: string): string => {
    const trimmedCode = code.trim();
    
    if (trimmedCode.startsWith('#')) {
      return ''; // 주석
    } else if (trimmedCode.includes('print(')) {
      const match = trimmedCode.match(/print\('([^']*)'\)/);
      return match ? match[1] : 'None';
    } else if (trimmedCode.includes('import ')) {
      const match = trimmedCode.match(/import\s+(\w+)/);
      return match ? `Module '${match[1]}' imported successfully` : '';
    } else if (trimmedCode.includes('=')) {
      const match = trimmedCode.match(/(\w+)\s*=\s*(.+)/);
      return match ? `${match[1]} = ${match[2]}` : '';
    } else if (trimmedCode.match(/^\d+[\+\-\*\/]\d+$/)) {
      try {
        return eval(trimmedCode).toString();
      } catch {
        return `SyntaxError: invalid syntax in '${trimmedCode}'`;
      }
    } else if (trimmedCode && !trimmedCode.startsWith('#')) {
      return `NameError: name '${trimmedCode}' is not defined`;
    }
    
    return '';
  };

  // 셀 내용 업데이트
  const updateCellContent = (cellId: number, content: string) => {
    setJupyterCells(prevCells =>
      prevCells.map(cell =>
        cell.id === cellId ? { ...cell, content } : cell
      )
    );
  };

  // 새 셀 추가
  const addNewCell = () => {
    const newCellId = Math.max(...jupyterCells.map(c => c.id)) + 1;
    setJupyterCells(prevCells => [
      ...prevCells,
      {
        id: newCellId,
        content: "# 여기에 Python 코드를 입력하세요...",
        output: '',
        executed: false,
        executionCount: null
      }
    ]);
  };

  // IDE 선택 화면
  if (currentView === 'select') {
    return (
      <Box sx={{ 
        height: 'calc(100vh - 64px)',
        background: '#1e1e1e',
        position: 'fixed',
        top: 64,
        left: 240,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Box sx={{ textAlign: 'center', maxWidth: 600 }}>
          <Typography variant="h4" sx={{ color: 'white', mb: 4, fontWeight: 700 }}>
            개발 환경 선택
          </Typography>
          <Typography variant="body1" sx={{ color: '#cccccc', mb: 6, fontSize: '16px' }}>
            사용할 개발 환경을 선택해주세요
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Box sx={{ width: 280 }}>
              <Card 
                sx={{ 
                  background: '#2d2d30', 
                  border: '2px solid #3e3e42',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#007acc',
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0, 122, 204, 0.3)'
                  }
                }}
                onClick={() => setCurrentView('vscode')}
              >
                <CardActionArea sx={{ p: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                      <CodeIcon sx={{ fontSize: 64, color: '#007acc' }} />
                    </Box>
                    <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
                      VS Code
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#cccccc', lineHeight: 1.6 }}>
                      완전한 코드 에디터 환경
                      <br />
                      파일 탐색기, 터미널, 디버깅 지원
                      <br />
                      다중 언어 및 확장 기능
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Box>
            
            <Box sx={{ width: 280 }}>
              <Card 
                sx={{ 
                  background: '#2d2d30', 
                  border: '2px solid #3e3e42',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#f39c12',
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(243, 156, 18, 0.3)'
                  }
                }}
                onClick={() => setCurrentView('jupyter')}
              >
                <CardActionArea sx={{ p: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                      <ScienceIcon sx={{ fontSize: 64, color: '#f39c12' }} />
                    </Box>
                    <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
                      Jupyter Lab
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#cccccc', lineHeight: 1.6 }}>
                      데이터 과학 및 머신러닝 환경
                      <br />
                      노트북 기반 인터랙티브 개발
                      <br />
                      시각화 및 분석 도구
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  // Jupyter Lab 화면 - iframe으로 원본 화면 호출
  if (currentView === 'jupyter') {
    return (
      <Box sx={{ 
        height: 'calc(100vh - 64px)',
        background: '#ffffff',
        position: 'fixed',
        top: 64,
        left: 240,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* 헤더 */}
        <Box sx={{ 
          background: '#f8f9fa', 
          borderBottom: '1px solid #e9ecef',
          display: 'flex',
          alignItems: 'center',
          px: 2,
          py: 1
        }}>
          <IconButton 
            onClick={() => setCurrentView('select')}
            sx={{ color: '#495057', mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ color: '#495057', mr: 2, fontSize: '14px', fontWeight: 600 }}>
            Jupyter Lab
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            px: 1,
            py: 0.5,
            borderRadius: 1,
            background: jupyterConnected ? '#d4edda' : '#f8d7da',
            color: jupyterConnected ? '#155724' : '#721c24',
            fontSize: '11px',
            fontWeight: 600
          }}>
            {jupyterConnected ? '● 연결됨' : '○ 연결 안됨'}
          </Box>
        </Box>

        {/* Jupyter Lab iframe */}
        <Box sx={{ flex: 1, background: 'white' }}>
          <iframe
            src="http://127.0.0.1:8888/jupyter/lab"
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Jupyter Lab"
            allow="fullscreen"
          />
        </Box>

        {/* 연결 오류 알림 */}
        <Snackbar
          open={!!connectionError}
          autoHideDuration={6000}
          onClose={() => setConnectionError(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setConnectionError(null)} 
            severity="error" 
            sx={{ width: '100%' }}
          >
            {connectionError}
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  // VS Code 화면 - iframe으로 원본 화면 호출
  return (
    <Box sx={{ 
      height: 'calc(100vh - 64px)',
      position: 'fixed',
      top: 64,
      left: 240,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* VS Code 헤더 */}
      <Box sx={{ 
        background: '#f8f9fa', 
        borderBottom: '1px solid #e9ecef',
        display: 'flex',
        alignItems: 'center',
        px: 2,
        py: 1
      }}>
        <IconButton 
          onClick={() => setCurrentView('select')}
          sx={{ color: '#495057', mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ color: '#495057', fontSize: '14px', fontWeight: 600 }}>
          VS Code
        </Typography>
      </Box>

      {/* VS Code iframe */}
      <Box sx={{ flex: 1, background: 'white' }}>
        <iframe
          src="http://127.0.0.1:8443/?folder=/home"
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="VS Code"
          allow="fullscreen"
        />
      </Box>
    </Box>
  );
};

export default IDE; 