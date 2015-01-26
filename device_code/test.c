#include <msp430g2553.h>

unsigned int i = 0;

void subroutine()
{
  int x = 0;
  x += 9;

  return;
}

void main(void){
  asm(
      

      "CALL #0x1\n" 
      "CALL #0x8\n" 
      "CALL #-0x1\n" 
      "CALL &0x1234\n" 
      "CALL #0x72A\n" 
      "CALL 0x4\n" 
      "CALL &0x4\n" 

      "CALL R5\n"
      "CALL 0x2(R5)\n" 
      "CALL @R5\n" 
      "CALL @R5+\n" 

      "PUSH -0x2\n" 
      "PUSH 0x2\n" 
      "PUSH.B 0x4\n" 
      
      "PUSH &0xC000\n" 
      "PUSH.B &0xC010\n" 
      
      "PUSH #4\n" 
      "PUSH #8\n" 
      "PUSH #0\n"
      "PUSH #1\n"
      "PUSH #2\n"
      "PUSH #-1\n"
      
      "PUSH.B #4\n"
      "PUSH.B #8\n"
      "PUSH.B #0\n"
      "PUSH.B #1\n"
      "PUSH.B #2\n"
      "PUSH.B #-1\n"
      
      "PUSH #0x1234\n"
      "PUSH.B #0x78AB\n"

      "PUSH R5\n"
      "PUSH.B R5\n"
      "PUSH 0x2(R5)\n"
      "PUSH.B 0x2(R5)\n"
      "PUSH @R5\n"
      "PUSH.B @R5\n"
      "PUSH @R5+\n"
      "PUSH.B @R5+\n"
      
      "SXT R5\n"
      "SXT -0x2(R5)\n"
      "SXT @R5\n"
      "SXT @R5+\n"
      
      "RRA R5\n"
      "RRA.B R5\n"
      "RRA 0x2(R5)\n"
      "RRA.B 0x2(R5)\n"
      "RRA @R5\n"
      "RRA.B @R5\n"
      "RRA @R5+\n"
      "RRA.B @R5+\n"

      "SWPB R5\n"
      "SWPB 0x2(R5)\n"
      "SWPB @R5\n"
      "SWPB @R5+\n"
      
      "RRC R5\n"
      "RRC.B R5\n"
      "RRC @R5\n"
      "RRC.B @R5\n"
      "RRC @R5+\n"
      "RRC.B @R5+\n"
      "RRC.B 0xF(R5)\n"
      "RRC -0x4(R5)\n"
      );
  
  // Stop the watchdog timer
  WDTCTL = WDTPW + WDTHOLD;

  i = 182;
    
  // A register that configures the direction of a port pin as an
  // input or output 
  P1DIR |= 0x10;

  while(1){
    P1OUT ^= 0x10;
    for(i = 0;i < 30000;i++);
  }
 
}
